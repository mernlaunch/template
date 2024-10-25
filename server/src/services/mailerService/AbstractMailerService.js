class AbstractMailerService {

  /**
   * Sends an email to the specified recipient.
   * 
   * @param {string} to - The recipient's email address.
   * @param {string} subject - The subject of the email.
   * @param {string} text - The plain text version of the email content.
   * @param {string} html - The HTML version of the email content.
   * @returns {Promise<void>} A promise that resolves when the email is sent successfully.
   * @throws {Error} If the email sending fails.
   */
  static async sendEmail(to, subject, text, html) {
    throw new Error('Method not implemented');
  }
}

module.exports = AbstractMailerService;
