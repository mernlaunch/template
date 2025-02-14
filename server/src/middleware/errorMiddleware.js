import { AppError } from '../errors/index.js';

/**
 * Global error handling middleware for Express
 * Converts all errors to [`AppError`](server/src/errors/index.js) format and sends standardized response
 * 
 * @param {Error} err - Error object caught by Express
 * @param {Request} req - Express request object 
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export default (err, req, res, next) => {
  // Convert non-AppError instances to AppError
  if (!(err instanceof AppError)) {
    console.error(err);
    // If the error is not an AppError, it's unexpected, and we don't want to expose the details
    err = new AppError('Internal server error', 500, err);
  }

  // Send standardized error response
  res.status(err.statusCode).json({
    status: err.status,    // 'fail' for 4xx, 'error' for 5xx
    message: err.message,  // User-friendly error message
  });
};
