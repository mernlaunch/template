const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('config');
const bodyParser = require('body-parser');

const AbstractPaymentService = require('./AbstractPaymentService');
const { AppError } = require('../../errors');

const PRICE_ID = process.env.STRIPE_PRICE_ID;
const CLIENT_URL = process.env.CLIENT_URL;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

class StripePaymentService extends AbstractPaymentService {
  static #getValidWebhookEventUser(event) {
    if (event.type != 'checkout.session.completed') return null;
    if (event.data.object.payment_status != 'paid') return null;

    const email = event.data.object.customer_details.email;
    const paymentCustomerId = event.data.object.customer;

    if (!paymentCustomerId || !email) return null;
    return { paymentCustomerId, email };
  }

  static async createCustomer() {
    try {
      const customer = await stripe.customers.create();
      return customer.id;
    } catch (e) {
      throw new AppError('Failed to create customer', 500, e);
    }
  }

  static async createCheckoutSession(customerId) {
    try {
      const sessionParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: CLIENT_URL + config.get('stripe.successRoute'),
        cancel_url: CLIENT_URL + config.get('stripe.cancelRoute'),
        customer: customerId,
      };

      const { url } = await stripe.checkout.sessions.create(sessionParams);
      return url;
    } catch (e) {
      throw new AppError('Failed to create checkout session', 500, e);
    }
  }

  static getWebhookMiddleware() {
    return [
      bodyParser.raw({ type: 'application/json' }),
      (req, res, next) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
          event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
        } catch (e) {
          next(new AppError('Invalid webhook signature', 400, e));
        }

        const user = StripePaymentService.#getValidWebhookEventUser(event);
        if (!user) return res.status(200).send({ received: true });
        req.user = user;
        next();
      }
    ];
  }
}

module.exports = StripePaymentService;
