import users from '../models/userModel.js';
import { AppError } from '../errors/index.js';

export default async (req, res, next) => {
  try {
    const { userId } = req.session;
    if (!userId) return next(new AppError('Authentication required', 401));

    const user = await users.getWithId(userId);
    if (!user) return next(new AppError('Authentication required', 401));

    next();

  } catch (error) {
    next(new AppError('Authentication failed', 500, error))
  }
};
