import express from 'express';
import { paymentService } from '../services/index.js';
import users from '../models/userModel.js';
import { AppError } from '../errors/index.js';

const publicRouter = express.Router();

publicRouter.post('/checkout-session', async (req, res, next) => {
  try {
    const paymentCustomerId = await paymentService.createCustomer();
    const checkoutUrl = await paymentService.createCheckoutSession(paymentCustomerId);
    await users.create(paymentCustomerId);
    return res.status(201).json({ checkoutUrl });
  } catch (e) {
    next(new AppError('Unable to process checkout', 500, e));
  }
});

publicRouter.post('/authenticate', async (req, res, next) => {
  const authToken = req.headers['authorization']?.split(' ')[1];
  if (!authToken) return next(new AppError('Authentication required', 401));

  try {
    const user = await users.getWithAuthToken(authToken);
    if (!user) return next(new AppError('Authentication failed', 401));

    req.session.userId = user._id;
    return res.status(200).json({ message: 'Authenticated' });
  } catch (e) {
    next(new AppError('Authentication failed', 401, e));
  }
});

publicRouter.post('/deauthenticate', async (req, res) => {
  try {
    req.session.userId = undefined;
    return res.status(200).json({ message: 'Deauthenticated' });
  } catch (e) {
    next(new AppError('Unable to deauthenticate', 500, e));
  }
});

publicRouter.get('/is-authenticated', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) return res.status(200).json({ isAuthenticated: false });
    const user = await users.getWithId(userId);
    if (!user) return res.status(200).json({ isAuthenticated: false });
    return res.status(200).json({ isAuthenticated: true });
  } catch (e) {
    next(new AppError('Unable to verify authentication', 500, e));
  }
});

export default publicRouter;
