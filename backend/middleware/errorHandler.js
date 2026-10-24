/**
 * Centralized error handling middleware for StyleStack backend.
 * Returns structured error responses matching both { error: message } and { success: false, message }.
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    message: message,
  });
};

module.exports = errorHandler;
