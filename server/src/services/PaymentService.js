import Service from './Service.js';
import stripe from 'stripe';
import bodyParser from 'body-parser';

export default class PaymentService extends Service {
  #stripeClient;

  constructor(
    stripeSecretKey, 
    priceId, 
    clientUrl, 
    successRoute, 
    cancelRoute, 
    webhookSecret 
  ) {
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

  async createCustomer() {
    try {
      const customer = await this.#stripeClient.customers.create();
      return customer.id;
    } catch (e) {
      throw this.createError('Failed to create customer', e);
    }
  }

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

  #getValidWebhookEvent(req) {
    const sig = req.headers['stripe-signature'];
    const event = this.#stripeClient.webhooks.constructEvent(
      req.body, 
      sig, 
      this._getConfig('webhookSecret')
    );
    return event;
  }

  #getValidWebhookEventUser(event) {
    if (event.type !== 'checkout.session.completed') return null;
    if (event.data.object.payment_status !== 'paid') return null;

    const email = event.data.object.customer_details.email;
    const paymentCustomerId = event.data.object.customer;

    if (!paymentCustomerId || !email) return null;
    return { paymentCustomerId, email };
  }

  getWebhookMiddleware() {
    return [
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

          req.user = user;
          next();
        } catch (e) {
          next(this.createError('Invalid webhook signature', e));
        }
      }
    ];
  }
}
