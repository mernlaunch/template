import { AppError } from '../errors/index.js';
import users from '../models/userModel.js';

export default async (req, res, next) => {
  console.log(req.session);
  const {userId} = req.session;
  if (!userId) return next(new AppError('Unauthorized', 401));
  const user = await users.getWithId(userId);
  if (!user) return next(new AppError('Unauthorized', 401));
  next();
};
