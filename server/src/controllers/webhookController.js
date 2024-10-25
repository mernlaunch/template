const config = require('config');
const PaymentService = require('../services/paymentService');
const MailerService = require('../services/mailerService');
const users = require('../models/userModel');
const { AppError } = require('../errors');

const getPaymentMiddleware = PaymentService.getWebhookMiddleware;

async function handlePayment(req, res, next) {
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

module.exports = { getPaymentMiddleware, handlePayment };
