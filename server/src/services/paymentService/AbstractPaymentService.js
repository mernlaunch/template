class AbstractPaymentService {
  /**
   * Creates a customer for the payment processor.
   * @returns {Promise<string>} - The ID of the newly created customer.
   * @throws {Error} - If customer creation fails.
   */
  static async createCustomer() {
    throw new Error('Method not implemented');
  }

  /**
   * Creates a checkout session for the payment processor.
   * @param {string} customerId - The ID of the customer.
   * @returns {Promise<string>} - The URL to the checkout session.
   * @throws {Error} - If checkout session creation fails.
   */
  static async createCheckoutSession(customerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Gets the middleware for the payment processor's webhook.
   * This middleware should validate the request.
   * @returns {Function} - The middleware function.
   */
  static getWebhookMiddleware() {
    throw new Error('Method not implemented');
  };
}

module.exports = AbstractPaymentService;
