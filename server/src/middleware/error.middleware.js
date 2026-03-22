const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: Object.values(err.errors || {}).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key',
    });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
