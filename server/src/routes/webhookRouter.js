import express from 'express';
import { paymentService, mailerService } from '../services/index.js';
import users from '../models/userModel.js';

/**
 * Router for handling webhook callbacks
 * Accessed through the /webhook prefix (configurable in config/default.yaml)
 */
const webhookRouter = express.Router();

/**
 * Handles successful payment webhooks from Stripe
 * Verifies payment and sends auth token via email
 * @route POST /webhook/payment
 * @middleware paymentService.getWebhookMiddleware() - Validates Stripe signature and extracts user data
 */
webhookRouter.post('/payment',
  paymentService.getWebhookMiddleware(),
  async (req, res, next) => {
    // Because of the middleware, we know this request is a valid Stripe webhook, indicating a payment
    // User data added by PaymentService middleware
    const { paymentCustomerId, email } = req.user;

    try {
      // Mark user as paid and generate auth token
      const user = await users.verifyPaid(paymentCustomerId, email);
      if (!user) return res.json({ received: true });

      // Send auth token via email using template
      // This template is defined in the config/default.yaml file
      await mailerService.sendTemplate(
        email,
        mailerService.templates.newAuthToken,
        { AUTH_TOKEN: user.authToken }
      );

      // Always return 200 to Stripe
      return res.json({ received: true });
    } catch (e) {
      console.error(e);
      return res.json({ received: true });
    }
  }
);

export default webhookRouter;
