import users from '../models/userModel.js';

export default async (req, res, next) => {
  const { userId } = req.session;
  if (!userId) return next(new Error('Unauthorized'));
  const user = await users.getWithId(userId);
  if (!user) return next(new Error('Unauthorized'));
  next();
};
