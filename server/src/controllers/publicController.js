const PaymentService = require('../services/paymentService');
const users = require('../models/userModel');

async function createCheckoutSession(req, res, next) {
  try {
    const paymentCustomerId = await PaymentService.createCustomer();
    const checkoutUrl = await PaymentService.createCheckoutSession(paymentCustomerId);
    await users.create(paymentCustomerId);
    return res.status(201).json({ checkoutUrl });
  } catch (e) {
    next(e);
  }
}

async function authenticate(req, res, next) {
  const authToken = req.headers['authorization']?.split(' ')[1];
  if (!authToken) return next(new AppError('No token provided', 401));

  try {
    const user = await users.getWithAuthToken(authToken);
    if (!user) return next(new AppError('Invalid token', 401));
    req.session.user = user;
    return res.status(200).json({ message: 'Authenticated' });
  } catch (e) {
    next(e);
  }
};

async function deauthenticate(req, res, next) {
  req.session.user = null;
  return res.status(200).json({ message: 'Deauthenticated' });
}

module.exports = { createCheckoutSession, authenticate, deauthenticate };
