import Service from './Service.js';
import sendgrid from '@sendgrid/mail';

/**
 * Email service for sending transactional emails via SendGrid
 * Provides methods for sending custom emails and templates
 * @extends Service
 */
export default class MailerService extends Service {
  /**
   * Names of all email templates configured in config/default.yaml.
   * Allows you to easily refer to a specific template by name.
   * @public
   */
  templates;

  /**
   * Creates new MailerService instance
   * @param {string} apiKey - SendGrid API key
   * @param {string} senderAddress - From email address for all emails
   * @param {Object} templates - Email templates from config
   */
  constructor(apiKey, senderAddress, templates) {
    // Initialize the parent class, setting the `requiredConfig` property
    super({ apiKey, senderAddress, templates });

    // Convert template config into easily accessible properties
    this.templates = Object.keys(templates).reduce((acc, templateName) => {
      acc[templateName] = templateName;
      return acc;
    }, {});

    // Initialize SendGrid client
    sendgrid.setApiKey(this._getConfig('apiKey'));
  }

  /**
   * Sends a basic email without template
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject line
   * @param {string} text - Plain text email content
   * @param {string} [html] - Optional HTML email content
   * @throws {ServiceError} If sending fails or missing params
   */
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

  /**
   * Sends an email using a predefined template with variable substitution
   * Templates are defined in config/default.yaml under services.mailer.templates
   * Variables in templates are denoted by ${VARIABLE_NAME}
   * @param {string} to - Recipient email address
   * @param {string} template - Template name from config
   * @param {Object} variables - Values to substitute in template
   * @throws {ServiceError} If template not found or sending fails
   */
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

  /**
   * Replaces template variables with provided values
   * @param {string} text - Template text containing ${VAR} placeholders
   * @param {Object} variables - Key-value pairs for replacement
   * @returns {string} Text with variables replaced
   * @private
   */
  #replaceVariables(text, variables) {
    return Object.entries(variables).reduce((result, [key, value]) => {
      return result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }, text);
  }
}
