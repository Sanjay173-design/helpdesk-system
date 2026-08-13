const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../services/emailService');

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

  await sendWelcomeEmail({
    to: user.email,
    name: user.name,
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

// PATCH /api/auth/me
// Update the authenticated user's profile and optionally change password.
const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    currentPassword,
    newPassword,
    confirmPassword,
  } = req.body;

  // ---------------------------------------------------------
  // 1. Update profile
  // ---------------------------------------------------------
  if (name !== undefined) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new AppError('Name cannot be empty', 400);
  }

  req.user.name = name.trim();
}

  // ---------------------------------------------------------
  // 2. Check whether password change was requested
  // ---------------------------------------------------------
  const changingPassword =
    currentPassword ||
    newPassword ||
    confirmPassword;

  if (changingPassword) {
    // All three fields are required
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      throw new AppError(
        'All password fields are required',
        400
      );
    }

    // Confirm new password
    if (newPassword !== confirmPassword) {
      throw new AppError(
        'New passwords do not match',
        400
      );
    }

    // Minimum length
    if (newPassword.length < 8) {
      throw new AppError(
        'New password must be at least 8 characters',
        400
      );
    }

    // Must contain a number
    if (!/\d/.test(newPassword)) {
      throw new AppError(
        'New password must contain a number',
        400
      );
    }

    // Verify current password
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      req.user.passwordHash
    );

    if (!passwordMatches) {
      throw new AppError(
        'Current password is incorrect',
        401
      );
    }

    // Prevent reusing current password
    const sameAsCurrent = await bcrypt.compare(
      newPassword,
      req.user.passwordHash
    );

    if (sameAsCurrent) {
      throw new AppError(
        'New password must be different from your current password',
        400
      );
    }

    // Hash new password
    req.user.passwordHash = await bcrypt.hash(
      newPassword,
      10
    );
  }

  // ---------------------------------------------------------
  // 3. Save everything together
  // ---------------------------------------------------------
  await req.user.save();

  res.json({
    success: true,
    message: changingPassword
      ? 'Profile and password updated successfully. Please log in again.'
      : 'Profile updated successfully.',
    data: {
      user: req.user.toSafeJSON(),
    },
  });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }
  const user = await User.findOne({
    where: { email },
  });

  // Do not reveal whether the email exists.
  if (!user) {
    return res.json({
      success: true,
      message:
        'If an account exists with this email, a password reset link will be sent.',
    });
  }

  // Generate a secure random token.
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Store only the hash in the database.
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Token expires after 30 minutes.
  const resetTokenExpires = new Date(
    Date.now() + 30 * 60 * 1000
  );
  await user.update({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: resetTokenExpires,
  });
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  // Temporary development logging.
  // We'll replace this with email sending later.
  await sendPasswordResetEmail({
  to: user.email,
  name: user.name,
  resetUrl,
});

  return res.json({
    success: true,
    message:
      'If an account exists with this email, a password reset link will be sent.',
  });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const {
    token,
    newPassword,
    confirmPassword,
  } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    throw new AppError('All fields are required', 400);
  }
  if (newPassword !== confirmPassword) {
    throw new AppError('New passwords do not match', 400);
  }
  if (newPassword.length < 8) {
    throw new AppError(
      'New password must be at least 8 characters',
      400
    );
  }
  if (!/\d/.test(newPassword)) {
    throw new AppError(
      'New password must contain a number',
      400
    );
  }

  // Hash the token received from the reset link.
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const user = await User.findOne({
    where: {
      passwordResetToken: resetTokenHash,
    },
  });

  if (!user) {
    throw new AppError(
      'Invalid or expired password reset link',
      400
    );
  }
  if (
    !user.passwordResetExpires ||
    user.passwordResetExpires < new Date()
  ) {
    throw new AppError(
      'Invalid or expired password reset link',
      400
    );
  }

  // Prevent using the same password.
  const sameAsCurrent = await bcrypt.compare( newPassword, user.passwordHash );
  if (sameAsCurrent) {
    throw new AppError(
      'New password must be different from your current password',
      400
    );
  }

  const passwordHash = await bcrypt.hash( newPassword, 10 );
  // Reset the password and invalidate the reset token.
  await user.update({
    passwordHash,
    passwordResetToken: null,
    passwordResetExpires: null,
  });

  return res.json({
    success: true,
    message:
      'Password reset successfully. Please log in again.',
  });
});

module.exports = {
  register,
  login,
  refresh,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
};
