/**
 * Custom error class for application-wide error handling
 * Extends the built-in Error class with additional properties to help send the right response
 * All errors thrown in a route, should be an instance of this class
 * @extends Error
 */
export class AppError extends Error {
  /**
   * Creates a new application error
   * @param {string} message - Error message to display
   * @param {number} statusCode - HTTP status code 
   * @param {Error|null} originalError - Original error if this wraps another error
   */
  constructor(message, statusCode, originalError = null) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Flag for distinguishing operational errors from programming errors
    this.isOperational = true;

    // Capture the stack trace of the original error
    Error.captureStackTrace(this, this.constructor);
  }
}
