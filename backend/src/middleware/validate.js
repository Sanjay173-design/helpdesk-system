const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Runs after an array of express-validator checks; short-circuits with a
// 422 and a structured list of field errors if any check failed.
module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new AppError('Validation failed', 422, details));
  }
  next();
};
