import MailerService from './MailerService.js';
import DBService from './DBService.js';
import PaymentService from './PaymentService.js';
import config from 'config';

let services = null;

export function initializeServices() {
  if (services) return services;

  services = {
    mailerService: new MailerService(
      process.env.SENDGRID_API_KEY,
      config.get('emailAddress')
    ),
    dbService: new DBService(
      process.env.DB_URI
    ),
    paymentService: new PaymentService(
      process.env.STRIPE_SECRET_KEY,
      process.env.STRIPE_PRICE_ID,
      process.env.CLIENT_URL,
      config.get('stripe.successRoute'),
      config.get('stripe.cancelRoute'),
      process.env.STRIPE_WEBHOOK_SECRET
    )
  };

  return services;
};

export const { mailerService, dbService, paymentService } = initializeServices();
