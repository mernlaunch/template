import config from 'config';
import PaymentService from '../services/paymentService/index.js';
import MailerService from '../services/mailerService/index.js';
import users from '../models/userModel.js';
import { AppError } from '../errors/index.js';

export const getPaymentMiddleware = PaymentService.getWebhookMiddleware;

export async function handlePayment(req, res, next) {
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
};
