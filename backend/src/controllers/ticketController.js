const { Op } = require('sequelize');
const {
  Ticket,
  TicketComment,
  TicketStatusHistory,
  User,
  sequelize,
} = require('../models');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');

const STAFF_ROLES = ['agent', 'admin'];

// Generates a short human-friendly ticket number, e.g. TCK-2026-000123
async function generateTicketNumber() {
  const year = new Date().getFullYear();
  const count = await Ticket.count({ paranoid: false });
  const seq = String(count + 1).padStart(6, '0');
  return `TCK-${year}-${seq}`;
}

// Builds the WHERE clause a caller is allowed to see:
// customers only ever see their own tickets, staff can see everything
// (and additionally filter by assignment).
function scopeForUser(user, where) {
  if (user.role === 'customer') {
    where.createdBy = user.id;
  }
  return where;
}

// GET /api/tickets
// Supports: page, limit, status, priority, category, assignedTo, search
const listTickets = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;

  const where = {};
  scopeForUser(req.user, where);

  if (req.query.status) where.status = req.query.status;
  if (req.query.priority) where.priority = req.query.priority;
  if (req.query.category) where.category = req.query.category;
  if (req.query.assignedTo) {
  if (STAFF_ROLES.includes(req.user.role)) {
    where.assignedTo =
      req.query.assignedTo === 'unassigned'
        ? null
        : req.query.assignedTo;
  } else if (
    req.user.role === 'customer' &&
    req.query.assignedTo === 'unassigned'
  ) {
    where.assignedTo = null;
  }
 }
  if (req.query.search) {
    const term = `%${req.query.search}%`;
    where[Op.or] = [
      { subject: { [Op.iLike]: term } },
      { ticketNumber: { [Op.iLike]: term } },
    ];
  }

  const sortableFields = ['createdAt', 'updatedAt', 'priority', 'status'];
  const sortBy = sortableFields.includes(req.query.sortBy)
    ? req.query.sortBy
    : 'createdAt';
  const sortDir = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';

  const { rows, count } = await Ticket.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortDir]],
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
    ],
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    },
  });
});

// GET /api/tickets/:id
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
      {
        model: TicketComment,
        as: 'comments',
        where: req.user.role === 'customer'
          ? { isInternal: false }
          : undefined,
        required: false,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'role'],
          },
        ],
        order: [['createdAt', 'ASC']],
      },
      {
        model: TicketStatusHistory,
        as: 'history',
        include: [
          {
            model: User,
            as: 'changer',
            attributes: ['id', 'name', 'role'],
          },
        ],
        order: [['createdAt', 'ASC']],
      },
    ],
  });

  if (!ticket) throw new AppError('Ticket not found', 404);

  if (req.user.role === 'customer' && ticket.createdBy !== req.user.id) {
    throw new AppError('You do not have access to this ticket', 403);
  }

  res.json({ success: true, data: ticket });
});

// POST /api/tickets
const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, priority, category } = req.body;

  const ticket = await sequelize.transaction(async (t) => {
    const ticketNumber = await generateTicketNumber();
    const created = await Ticket.create(
      {
        ticketNumber,
        subject,
        description,
        priority: priority || 'medium',
        category: category || null,
        createdBy: req.user.id,
      },
      { transaction: t }
    );

    await TicketStatusHistory.create(
      {
        ticketId: created.id,
        changedBy: req.user.id,
        fromStatus: null,
        toStatus: 'open',
        note: 'Ticket created',
      },
      { transaction: t }
    );

    return created;
  });

  res.status(201).json({ success: true, data: ticket });
});

// PATCH /api/tickets/:id
// Handles subject/description/category/priority edits and, when `status`
// or `assignedTo` is present, records it in the audit history too.
// Uses the `version` field for optimistic concurrency control.
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', 404);

  const isOwner = ticket.createdBy === req.user.id;
  const isStaff = STAFF_ROLES.includes(req.user.role);

  if (!isOwner && !isStaff) {
    throw new AppError('You do not have access to this ticket', 403);
  }

  const { version, status, assignedTo, priority, category, subject,
    description, note } = req.body;

  if (typeof version !== 'number') {
    throw new AppError('version is required to update a ticket', 400);
  }
  if (version !== ticket.version) {
    throw new AppError(
      'This ticket was modified by someone else. Refresh and try again.',
      409
    );
  }

  // Customers may only edit subject/description on their own open tickets;
  // everything else (status, assignment, priority triage) is staff-only.
  if (!isStaff) {
    if (ticket.status !== 'open') {
      throw new AppError('Only open tickets can be edited by their creator', 400);
    }
    if (status !== undefined || assignedTo !== undefined || priority !== undefined || category !== undefined) {
      throw new AppError('Only staff can change status, priority, assignment, or category', 403);
    }
  }

  // Only active agents can be assigned to tickets
if (assignedTo !== undefined && assignedTo !== null) {
  const agent = await User.findOne({
    where: {
      id: assignedTo,
      role: 'agent',
      isActive: true,
    },
  });
  if (!agent) {
    throw new AppError('assignedTo must reference an active agent', 400);
  }
}

  await sequelize.transaction(async (t) => {
    const changes = {};
    if (subject !== undefined) changes.subject = subject;
    if (description !== undefined) changes.description = description;
    if (category !== undefined) changes.category = category;
    if (priority !== undefined) changes.priority = priority;
    if (assignedTo !== undefined) changes.assignedTo = assignedTo;

    if (status !== undefined && status !== ticket.status) {
      changes.status = status;
      if (status === 'resolved') changes.resolvedAt = new Date();
      if (status === 'closed') changes.closedAt = new Date();

      await TicketStatusHistory.create(
        {
          ticketId: ticket.id,
          changedBy: req.user.id,
          fromStatus: ticket.status,
          toStatus: status,
          note: note || null,
        },
        { transaction: t }
      );
    }

    await ticket.update(changes, { transaction: t });
  });

  await ticket.reload({
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
    ],
  });

  res.json({ success: true, data: ticket });
});

// DELETE /api/tickets/:id  (admin only - soft delete via paranoid)
const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', 404);
  await ticket.destroy();
  res.status(204).send();
});

// POST /api/tickets/:id/comments
const addComment = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', 404);

  const isOwner = ticket.createdBy === req.user.id;
  const isStaff = STAFF_ROLES.includes(req.user.role);
  if (!isOwner && !isStaff) {
    throw new AppError('You do not have access to this ticket', 403);
  }

  const { body, isInternal } = req.body;

  // Only staff can post internal notes; customers can never set this flag
  const comment = await TicketComment.create({
    ticketId: ticket.id,
    authorId: req.user.id,
    body,
    isInternal: isStaff ? Boolean(isInternal) : false,
  });

  const withAuthor = await TicketComment.findByPk(comment.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }],
  });

  res.status(201).json({ success: true, data: withAuthor });
});

module.exports = {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  addComment,
};
