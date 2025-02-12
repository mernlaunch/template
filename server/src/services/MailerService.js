import Service from './Service.js';
import sendgrid from '@sendgrid/mail';

export default class MailerService extends Service {
  templates;

  constructor(apiKey, senderAddress, templates) {
    super({ apiKey, senderAddress, templates });
    this.templates = Object.keys(templates).reduce((acc, templateName) => {
      acc[templateName] = templateName;
      return acc;
    }, {});
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

  async sendTemplate(to, template, variables = {}) {
    this._validateParams({ to, template }, ['to', 'template']);

    const templateConfig = this._getConfig('templates')[template];

    if (!templateConfig) {
      throw this.createError(`Template not found: ${template}`);
    }

    try {
      const subject = this.#replaceVariables(templateConfig.subject, variables);
      const text = this.#replaceVariables(templateConfig.text, variables);
      const html = templateConfig.html ?
        this.#replaceVariables(templateConfig.html, variables) :
        undefined;
      await this.send(to, subject, text, html);

    } catch (e) {
      throw this.createError('Failed to send email template', e);
    }
  }

  #replaceVariables(text, variables) {
    return Object.entries(variables).reduce((result, [key, value]) => {
      return result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }, text);
  }
}
