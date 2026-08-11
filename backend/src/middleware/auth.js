const AppError = require('../utils/appError');
const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

// Verifies the JWT access token and attaches req.user
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication token missing', 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await User.findByPk(payload.sub);
    if (!user || !user.isActive) {
      throw new AppError('User no longer exists or is inactive', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Restricts a route to a set of roles, e.g. authorize('agent', 'admin')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = { authenticate, authorize };
