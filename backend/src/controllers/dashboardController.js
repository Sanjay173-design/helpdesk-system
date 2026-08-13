const { Op, fn, col } = require('sequelize');
const { Ticket, User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const STAFF_ROLES = ['agent', 'admin'];

const getDashboard = asyncHandler(async (req, res) => {
  const isStaff = STAFF_ROLES.includes(req.user.role);
  const isAgent = req.user.role === 'agent';
  const isAdmin = req.user.role === 'admin';

  // Customers only see their own tickets.
  // Staff can see the complete support system.
  const baseWhere = isStaff
    ? {}
    : { createdBy: req.user.id };

  // ------------------------------------------------------------
  // 1. Overall ticket summary
  // ------------------------------------------------------------

  const [
    total,
    open,
    inProgress,
    onHold,
    resolved,
    closed,
  ] = await Promise.all([
    Ticket.count({ where: baseWhere }),
    Ticket.count({
      where: { ...baseWhere, status: 'open' },
    }),
    Ticket.count({
      where: { ...baseWhere, status: 'in_progress' },
    }),
    Ticket.count({
      where: { ...baseWhere, status: 'on_hold' },
    }),
    Ticket.count({
      where: { ...baseWhere, status: 'resolved' },
    }),
    Ticket.count({
      where: { ...baseWhere, status: 'closed' },
    }),
  ]);

  // ------------------------------------------------------------
  // 2. Priority overview
  // ------------------------------------------------------------

  const [
    lowPriority,
    mediumPriority,
    highPriority,
    urgentPriority,
  ] = await Promise.all([
    Ticket.count({
      where: { ...baseWhere, priority: 'low' },
    }),
    Ticket.count({
      where: { ...baseWhere, priority: 'medium' },
    }),
    Ticket.count({
      where: { ...baseWhere, priority: 'high' },
    }),
    Ticket.count({
      where: { ...baseWhere, priority: 'urgent' },
    }),
  ]);

  // ------------------------------------------------------------
  // 3. Recently updated tickets
  // ------------------------------------------------------------

  const recentTickets = await Ticket.findAll({
    where: baseWhere,
    attributes: [
      'id',
      'ticketNumber',
      'subject',
      'status',
      'priority',
      'category',
      'assignedTo',
      'createdAt',
      'updatedAt',
    ],
    order: [['updatedAt', 'DESC']],
    limit: 5,
  });

  // ------------------------------------------------------------
  // 4. Tickets assigned to current staff member
  // ------------------------------------------------------------

  let assignedToMe = [];

  if (isStaff) {
    assignedToMe = await Ticket.findAll({
      where: {
        assignedTo: req.user.id,
        status: {
          [Op.notIn]: ['resolved', 'closed'],
        },
      },
      attributes: [
        'id',
        'ticketNumber',
        'subject',
        'status',
        'priority',
        'category',
        'createdAt',
        'updatedAt',
      ],
      order: [['updatedAt', 'DESC']],
      limit: 5,
    });
  }

  // ------------------------------------------------------------
  // 5. Current agent's workload
  // ------------------------------------------------------------

  let myWorkload = null;

  if (isAgent) {
    const [
      myOpen,
      myInProgress,
      myOnHold,
    ] = await Promise.all([
      Ticket.count({
        where: {
          assignedTo: req.user.id,
          status: 'open',
        },
      }),
      Ticket.count({
        where: {
          assignedTo: req.user.id,
          status: 'in_progress',
        },
      }),
      Ticket.count({
        where: {
          assignedTo: req.user.id,
          status: 'on_hold',
        },
      }),
    ]);

    myWorkload = {
      open: myOpen,
      inProgress: myInProgress,
      onHold: myOnHold,
      active: myOpen + myInProgress + myOnHold,
    };
  }

  // ------------------------------------------------------------
  // 6. Admin: workload across all active agents
  // ------------------------------------------------------------

  let agentWorkload = [];

  if (isAdmin) {
    const agents = await User.findAll({
      where: {
        role: 'agent',
        isActive: true,
      },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    const groupedWorkload = await Ticket.findAll({
      where: {
        assignedTo: {
          [Op.ne]: null,
        },
        status: {
          [Op.in]: ['open', 'in_progress', 'on_hold'],
        },
      },
      attributes: [
        'assignedTo',
        'status',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['assignedTo', 'status'],
      raw: true,
    });

    const workloadMap = {};

    for (const agent of agents) {
      workloadMap[agent.id] = {
        id: agent.id,
        name: agent.name,
        open: 0,
        inProgress: 0,
        onHold: 0,
        active: 0,
      };
    }

    for (const row of groupedWorkload) {
      const agent = workloadMap[row.assignedTo];

      if (!agent) continue;

      const count = Number(row.count);

      if (row.status === 'open') {
        agent.open = count;
      }

      if (row.status === 'in_progress') {
        agent.inProgress = count;
      }

      if (row.status === 'on_hold') {
        agent.onHold = count;
      }

      agent.active =
        agent.open +
        agent.inProgress +
        agent.onHold;
    }

    agentWorkload = Object.values(workloadMap);
  }

  // ------------------------------------------------------------
  // Response
  // ------------------------------------------------------------

  res.json({
    success: true,
    data: {
      summary: {
        total,
        open,
        inProgress,
        onHold,
        resolved,
        closed,
      },

      priorityOverview: {
        low: lowPriority,
        medium: mediumPriority,
        high: highPriority,
        urgent: urgentPriority,
      },

      myWorkload,

      agentWorkload,

      recentTickets,

      assignedToMe,
    },
  });
});

module.exports = {
  getDashboard,
};