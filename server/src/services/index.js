import MailerService from './MailerService.js';
import DBService from './DBService.js';
import PaymentService from './PaymentService.js';
import config from 'config';

let services = null;

export function initializeServices() {
  if (services) return services;

  services = {};
  for (const [serviceName, options] of Object.entries(config.get('services'))) {
    if (!options.enabled) continue;

    switch (serviceName) {
      case 'mailer':
        services.mailerService = new MailerService(
          process.env.SENDGRID_API_KEY,
          options.config.senderAddress,
          options.config.templates
        );
        break;

      case 'db':
        services.dbService = new DBService(
          process.env.DB_URI,
          options.config.sessionCollection
        );
        break;

      case 'payment':
        services.paymentService = new PaymentService(
          process.env.STRIPE_SECRET_KEY,
          process.env.STRIPE_PRICE_ID,
          process.env.CLIENT_URL,
          options.config.successRoute,
          options.config.cancelRoute,
          process.env.STRIPE_WEBHOOK_SECRET
        );
        break;

      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  return services;
}

export const { mailerService, dbService, paymentService } = initializeServices();
