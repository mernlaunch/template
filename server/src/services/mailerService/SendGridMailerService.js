const sendgrid = require('@sendgrid/mail');
const config = require('config');
const AbstractMailerService = require('./AbstractMailerService');
const { AppError } = require('../../errors');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sendgrid.setApiKey(SENDGRID_API_KEY);

class SendGridMailerService extends AbstractMailerService {
  static async send(to, subject, text, html = undefined) {
    if (!html) html = text;
    try {
      await sendgrid.send({
        to,
        from: config.get('emailAddress'),
        subject,
        text,
        html
      });
    } catch (e) {
      throw new AppError('Failed to send email', 500, e);
    }
  }
}

module.exports = SendGridMailerService;
