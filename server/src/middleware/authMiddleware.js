const { AppError } = require('../errors');

module.exports = async (req, res, next) => {
  const user = req.session.user;
  if (!user) return next(new AppError('Unauthorized', 401));
  next();
};
