import { AppError } from '../errors/index.js';

export default (err, req, res, next) => {
  console.error(err.rawError || err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
};
