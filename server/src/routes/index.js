import express from 'express';
import PaymentService from '../services/paymentService/index.js';
import MailerService from '../services/mailerService/index.js';
import users from '../models/userModel.js';
import { AppError } from '../errors/index.js';
import config from 'config';
import authMiddleware from '../middleware/authMiddleware.js';

export const publicRouter = express.Router();
export const protectedRouter = express.Router();
export const webhookRouter = express.Router();

// Public Routes Controllers
publicRouter.post('/checkout-session', async (req, res, next) => {
  try {
    const paymentCustomerId = await PaymentService.createCustomer();
    const checkoutUrl = await PaymentService.createCheckoutSession(paymentCustomerId);
    await users.create(paymentCustomerId);
    return res.status(201).json({ checkoutUrl });
  } catch (e) {
    next(e);
  }
});

publicRouter.post('/authenticate', async (req, res, next) => {
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
});

publicRouter.post('/deauthenticate', async (req, res) => {
  req.session.userId = undefined;
  return res.status(200).json({ message: 'Deauthenticated' });
});

publicRouter.get('/is-authenticated', async (req, res) => {
  const {userId} = req.session;
  if (!userId) return res.status(200).json({ isAuthenticated: false });
  const user = await users.getWithId(userId);
  if (!user) return res.status(200).json({ isAuthenticated: false });
  return res.status(200).json({ isAuthenticated: true });
});


// Protected Routes Controllers
protectedRouter.use(authMiddleware);
protectedRouter.get('/test-data', (req, res) => {
  res.json({ message: 'Only paid members can access this info!' });
});


// Webhook Routes Controllers
webhookRouter.post('/payment', 
  PaymentService.getWebhookMiddleware(),
  async (req, res, next) => {
    const { paymentCustomerId, email } = req.user;

    try {
      const user = await users.verifyPaid(paymentCustomerId, email);
      if (!user) throw new AppError('User not found', 404);
      const emailContent = {
        subject: config.get('emailTemplates.newAuthToken.subject'),
        text: config.get('emailTemplates.newAuthToken.text'),
        html: config.get('emailTemplates.newAuthToken.html'),
      };
      await MailerService.send(
        email,
        emailContent.subject.replace('${AUTH_TOKEN}', user.authToken),
        emailContent.text.replace('${AUTH_TOKEN}', user.authToken),
        emailContent.html.replace('${AUTH_TOKEN}', user.authToken)
      );
      return res.json({ received: true });
    } catch (e) {
      next(e);
    }
  }
);
