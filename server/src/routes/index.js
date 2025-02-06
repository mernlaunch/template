import express from 'express';
import * as publicController from '../controllers/publicController.js';
import * as protectedController from '../controllers/protectedController.js';
import * as webhookController from '../controllers/webhookController.js';
import authMiddleware from '../middleware/authMiddleware.js';

export const publicRouter = express.Router();
publicRouter.post('/checkout-session', publicController.createCheckoutSession);
publicRouter.post('/authenticate', publicController.authenticate);
publicRouter.post('/deauthenticate', publicController.deauthenticate);
publicRouter.get('/is-authenticated', publicController.getIsAuthenticated);

export const protectedRouter = express.Router();
protectedRouter.use(authMiddleware);
protectedRouter.get('/test-data', protectedController.getTestData);

export const webhookRouter = express.Router();
webhookRouter.post('/payment', webhookController.getPaymentMiddleware(), webhookController.handlePayment);
