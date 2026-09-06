// Centralized error handler - keeps controllers free of repetitive try/catch blocks
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((error) => error.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A resource with the same identifier already exists';
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

// Wraps an async route handler so any thrown/rejected error reaches errorHandler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler, notFoundHandler };
