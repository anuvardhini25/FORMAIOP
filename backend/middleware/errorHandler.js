const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  let statusCode = Number(err.statusCode || err.status || 500);
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((error) => error.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'The supplied identifier is invalid';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A resource with the same identifier already exists';
  }

  if (statusCode >= 500) {
    statusCode = 500;
    message = 'Something went wrong. Please try again.';
  }

  res.status(statusCode).json({ success: false, message });
};

const notFoundHandler = (req, res) => res.status(404).json({ success: false, message: 'Route not found' });
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler, notFoundHandler };
