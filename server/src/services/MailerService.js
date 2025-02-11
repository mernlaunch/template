import Service from './Service.js';
import sendgrid from '@sendgrid/mail';

export default class MailerService extends Service {

  constructor(apiKey, senderAddress) {
    super({ apiKey, senderAddress });
    sendgrid.setApiKey(this._getConfig('apiKey'));
  }

  async send(to, subject, text, html = undefined) {
    this._validateParams({ to, subject, text }, ['to', 'subject', 'text']);
    if (!html) html = text;
    
    try {
      await sendgrid.send({
        to,
        from: this._getConfig('senderAddress'),
        subject,
        text,
        html
      });

    } catch (e) {
      throw this.createError('Failed to send email', e);
    }
  }
}
