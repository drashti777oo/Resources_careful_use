import { errorResponse } from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || null;

  if (process.env.NODE_ENV === 'production') {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  return errorResponse(res, statusCode, message, {
    stack: err.stack,
    errors,
  });
};

export default errorHandler;
