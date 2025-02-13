import express from 'express';
import { paymentService, mailerService } from '../services/index.js';
import users from '../models/userModel.js';

const webhookRouter = express.Router();

webhookRouter.post('/payment',
  paymentService.getWebhookMiddleware(),
  async (req, res, next) => {
    const { paymentCustomerId, email } = req.user;

    try {
      const user = await users.verifyPaid(paymentCustomerId, email);
      if (!user) return res.json({ received: true });
      await mailerService.sendTemplate(
        email,
        mailerService.templates.newAuthToken,
        { AUTH_TOKEN: user.authToken }
      );

      return res.json({ received: true });
    } catch (e) {
      console.error(e);
      return res.json({ received: true });
    }
  }
);

export default webhookRouter;
