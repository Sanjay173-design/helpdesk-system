const bcrypt = require('bcryptjs');
const { User } = require('../models');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/users/agents - used to populate assignment dropdowns
const listAgents = asyncHandler(async (req, res) => {
  const agents = await User.findAll({
    where: { role: 'agent', isActive: true },
    attributes: ['id', 'name', 'email'],
    order: [['name', 'ASC']],
  });
  res.json({ success: true, data: agents });
});

// GET /api/users (admin only)
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: users.map((u) => u.toSafeJSON()) });
});

// POST /api/users (admin only) - provision staff accounts
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });

  res.status(201).json({ success: true, data: user.toSafeJSON() });
});

// PATCH /api/users/:id (admin only) - activate/deactivate, change role
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  const { name, role, isActive } = req.body;
  const changes = {};
  if (name !== undefined) changes.name = name;
  if (role !== undefined) changes.role = role;
  if (isActive !== undefined) changes.isActive = isActive;

  await user.update(changes);
  res.json({ success: true, data: user.toSafeJSON() });
});

module.exports = { listAgents, listUsers, createUser, updateUser };
