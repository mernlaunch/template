import express from 'express';
import { paymentService } from '../services/index.js';
import users from '../models/userModel.js';
import { AppError } from '../errors/index.js';

/**
 * Router for public endpoints that don't require authentication
 * Accessed through the /public prefix (configurable in config/default.yaml)
 * Handles checkout creation and authentication flows
 */
const publicRouter = express.Router();

/**
 * Creates Stripe checkout session for new users
 * @route POST /public/checkout-session
 * @returns {Object} JSON with Stripe checkout URL
 * @throws {AppError} 500 if checkout creation fails
 */
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

/**
 * Authenticates user with token received via email
 * @route POST /public/authenticate
 * @header {string} Authorization - Bearer token
 * @returns {Object} Success message
 * @throws {AppError} 401 if token missing or invalid
 */
publicRouter.post('/authenticate', async (req, res, next) => {
  const authToken = req.headers['authorization']?.split(' ')[1];
  if (!authToken) return next(new AppError('Authentication required', 401));

  try {
    const user = await users.getWithAuthToken(authToken);
    if (!user) return next(new AppError('Authentication failed', 401));

    // Authenticated users have a valid session with a userId
    req.session.userId = user._id;
    return res.status(200).json({ message: 'Authenticated' });
  } catch (e) {
    next(new AppError('Authentication failed', 401, e));
  }
});

/**
 * Removes user's session
 * @route POST /public/deauthenticate
 * @returns {Object} Success message
 * @throws {AppError} 500 if session removal fails
 */
publicRouter.post('/deauthenticate', async (req, res) => {
  try {
    req.session.userId = undefined;
    return res.status(200).json({ message: 'Deauthenticated' });
  } catch (e) {
    next(new AppError('Unable to deauthenticate', 500, e));
  }
});

/**
 * Checks if user has valid session
 * @route GET /public/is-authenticated
 * @returns {Object} Authentication status
 * @throws {AppError} 500 if check fails
 */
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
