class AppError extends Error {
  constructor(message, statusCode, rawError = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.rawError = rawError;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
