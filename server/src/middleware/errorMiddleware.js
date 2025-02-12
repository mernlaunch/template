import { AppError } from '../errors/index.js';

export default (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    console.error(err);
    err = new AppError('Internal server error', 500, err);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
