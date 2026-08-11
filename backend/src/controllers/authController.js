const bcrypt = require('bcryptjs');
const { User } = require('../models');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

// POST /api/auth/register
// Public registration always creates a 'customer' - staff accounts are
// provisioned by an admin via POST /api/users, never via self-signup.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'customer',
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(201).json({
    success: true,
    data: { user: user.toSafeJSON(), accessToken, refreshToken },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  // Same error for "no user" and "wrong password" - don't reveal which
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.json({
    success: true,
    data: { user: user.toSafeJSON(), accessToken, refreshToken },
  });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findByPk(payload.sub);
  if (!user || !user.isActive) {
    throw new AppError('User no longer exists or is inactive', 401);
  }

  const accessToken = signAccessToken(user);
  res.json({ success: true, data: { accessToken } });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

module.exports = { register, login, refresh, me };
