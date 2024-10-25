const express = require('express');

const publicRouter = express.Router();
const publicController = require('../controllers/publicController');
publicRouter.post('/checkout-session', publicController.createCheckoutSession);
publicRouter.post('/authenticate', publicController.authenticate);
publicRouter.post('/deauthenticate', publicController.deauthenticate);

const protectedRouter = express.Router();
const protectedController = require('../controllers/protectedController');
const authMiddleware = require('../middleware/authMiddleware');
protectedRouter.use(authMiddleware);
protectedRouter.get('/is-auth', protectedController.getIsAuth);
protectedRouter.get('/test-data', protectedController.getTestData);

const webhookRouter = express.Router();
const webhookController = require('../controllers/webhookController');
webhookRouter.post('/payment', webhookController.getPaymentMiddleware(), webhookController.handlePayment);

module.exports = { publicRouter, protectedRouter, webhookRouter };
