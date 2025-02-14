import Service from './Service.js';
import stripe from 'stripe';
import bodyParser from 'body-parser';

/**
 * Payment processing service using Stripe
 * Handles customer creation, checkout sessions, and webhook processing
 * @extends Service
 */
export default class PaymentService extends Service {
  /** @private Initialized Stripe client instance */
  #stripeClient;

  /**
   * Creates new PaymentService instance
   * @param {string} stripeSecretKey - Secret key from Stripe dashboard
   * @param {string} priceId - Stripe Price ID for the product
   * @param {string} clientUrl - Base URL of the client application
   * @param {string} successRoute - Route in the client to redirect after successful payment
   * @param {string} cancelRoute - Route in the client to redirect after cancelled payment
   * @param {string} webhookSecret - Webhook signing secret from Stripe
   */
  constructor(
    stripeSecretKey,
    priceId,
    clientUrl,
    successRoute,
    cancelRoute,
    webhookSecret
  ) {
    // Initialize the parent class, setting the `requiredConfig` property
    super({
      stripeSecretKey,
      priceId,
      clientUrl,
      successRoute,
      cancelRoute,
      webhookSecret
    });
    this.#stripeClient = stripe(this._getConfig('stripeSecretKey'));
  }

  /**
   * Creates a new Stripe customer
   * @returns {Promise<string>} Stripe customer ID
   * @throws {ServiceError} If customer creation fails
   */
  async createCustomer() {
    try {
      const customer = await this.#stripeClient.customers.create();
      return customer.id;
    } catch (e) {
      throw this.createError('Failed to create customer', e);
    }
  }

  /**
   * Creates a Stripe checkout session for one-time payment
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<string>} Checkout session URL
   * @throws {ServiceError} If session creation fails or missing customerId
   */
  async createCheckoutSession(customerId) {
    this._validateParams({ customerId }, ['customerId']);

    try {
      const { url } = await this.#stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: this._getConfig('priceId'),
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this._getConfig('clientUrl')}${this._getConfig('successRoute')}`,
        cancel_url: `${this._getConfig('clientUrl')}${this._getConfig('cancelRoute')}`,
        customer: customerId,
      });
      return url;
    } catch (e) {
      throw this.createError('Failed to create checkout session', e);
    }
  }

  /**
   * Validates and constructs Stripe webhook event
   * @param {Request} req - Express request object
   * @returns {Object} Validated Stripe event
   * @private
   */
  #getValidWebhookEvent(req) {
    const sig = req.headers['stripe-signature'];
    const event = this.#stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      this._getConfig('webhookSecret')
    );
    return event;
  }

  /**
   * Extracts user data from webhook event if payment was successful
   * @param {Object} event - Stripe webhook event
   * @returns {Object|null} User data or null if invalid/incomplete
   * @private
   */
  #getValidWebhookEventUser(event) {
    if (event.type !== 'checkout.session.completed') return null;
    if (event.data.object.payment_status !== 'paid') return null;

    const email = event.data.object.customer_details.email;
    const paymentCustomerId = event.data.object.customer;

    if (!paymentCustomerId || !email) return null;
    return { paymentCustomerId, email };
  }

  /**
   * Creates middleware array for handling Stripe webhooks
   * Validates webhook signature and extracts user data
   * @returns {Array<Function>} Middleware functions
   */
  getWebhookMiddleware() {
    return [
      // Stripe requires the raw body to construct the event
      bodyParser.raw({ type: 'application/json' }),
      (req, res, next) => {
        try {
          const event = this.#getValidWebhookEvent(req);
          if (!event) {
            throw this.createError('No authenticated event');
          }

          const user = this.#getValidWebhookEventUser(event);
          if (!user) {
            return res.status(200).send({ received: true });
          }

          // Attach the user data (email and paymentCustomerId) to the request
          req.user = user;
          next();
        } catch (e) {
          next(this.createError('Invalid webhook signature', e));
        }
      }
    ];
  }
}
