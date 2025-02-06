import PaymentService from '../services/paymentService/index.js';
import users from '../models/userModel.js';
import { AppError } from '../errors/index.js';

export async function createCheckoutSession(req, res, next) {
  try {
    const paymentCustomerId = await PaymentService.createCustomer();
    const checkoutUrl = await PaymentService.createCheckoutSession(paymentCustomerId);
    await users.create(paymentCustomerId);
    return res.status(201).json({ checkoutUrl });
  } catch (e) {
    next(e);
  }
};

export async function authenticate(req, res, next) {
  const authToken = req.headers['authorization']?.split(' ')[1];
  if (!authToken) return next(new AppError('No token provided', 401));

  try {
    const user = await users.getWithAuthToken(authToken);
    if (!user) return next(new AppError('Invalid token', 401));
    req.session.userId = user._id;
    return res.status(200).json({ message: 'Authenticated' });
  } catch (e) {
    next(e);
  }
};

export async function deauthenticate(req, res, next) {
  req.session.userId = undefined;
  return res.status(200).json({ message: 'Deauthenticated' });
};

export async function getIsAuthenticated(req, res, next) {
  const {userId} = req.session;
  if (!userId) return res.status(200).json({ isAuthenticated: false });
  const user = await users.getWithId(userId);
  if (!user) return res.status(200).json({ isAuthenticated: false });
  return res.status(200).json({ isAuthenticated: true });
}
