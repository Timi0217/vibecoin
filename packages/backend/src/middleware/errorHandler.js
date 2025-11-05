/**
 * Error handling middleware
 */

/**
 * 404 Not Found handler
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Database errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  notFound,
  errorHandler
};
