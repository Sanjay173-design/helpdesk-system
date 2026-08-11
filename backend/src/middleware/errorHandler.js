const AppError = require('../utils/appError');

// 404 handler for unmatched routes
function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Centralized error handler - every error in the app funnels through here.
// Keeps error shape consistent and avoids leaking internals in production.
function errorHandler(err, req, res, next) {
  let error = err;

  // Translate known Sequelize errors into AppError so the response shape
  // stays consistent regardless of where the error originated.
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields || {});
    error = new AppError(
      `${fields.join(', ') || 'Field'} already in use`,
      409
    );
  } else if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new AppError('Validation failed', 422, details);
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new AppError('Referenced resource does not exist', 400);
  } else if (!(err instanceof AppError)) {
    // Unexpected/programmer error - don't leak details to the client
    console.error('UNEXPECTED ERROR:', err);
    error = new AppError('Something went wrong', 500);
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message,
  };
  if (error.details) response.errors = error.details;
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };
