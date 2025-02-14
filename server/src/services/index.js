/**
 * Services initialization module
 * This file manages the initialization and export of core application services.
 * For example:
 * - MailerService (Email handling via SendGrid)
 * - DBService (MongoDB database operations)
 * - PaymentService (Stripe payment processing)
 */

import MailerService from './MailerService.js';
import DBService from './DBService.js';
import PaymentService from './PaymentService.js';
import config from 'config';

let services = null;

/**
 * Initializes all enabled services based on configuration
 * Services are configured in config/default.yaml in the 'services' section
 * Each service requires specific environment variables and configuration options, and this is where they are set up
 * @returns {Object} Object containing initialized service instances
 */
export function initializeServices() {
  // Return existing services if already initialized (singleton pattern)
  if (services) return services;

  services = {};
  for (const [serviceName, options] of Object.entries(config.get('services'))) {
    // Only initialize services that are enabled in the configuration
    if (!options.enabled) continue;

    switch (serviceName) {
      case 'mailer':
        // Initialize email service with SendGrid
        services.mailerService = new MailerService(
          process.env.SENDGRID_API_KEY,
          options.config.senderAddress,
          options.config.templates
        );
        break;

      case 'db':
        // Initialize MongoDB connection and session store
        services.dbService = new DBService(
          process.env.DB_URI,
          options.config.sessionCollection
        );
        break;

      case 'payment':
        // Initialize Stripe payment processing
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

// Export initialized services for use throughout the application
export const { mailerService, dbService, paymentService } = initializeServices();
