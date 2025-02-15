/**
 * Main server entry point
 * This file configures and starts the Express server with all necessary middleware and services
 */

import 'dotenv/config';
import express from 'express';
import config from 'config';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import helmet from 'helmet';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import publicRouter from './src/routes/publicRouter.js';
import protectedRouter from './src/routes/protectedRouter.js';
import webhookRouter from './src/routes/webhookRouter.js';
import { initializeServices } from './src/services/index.js';
import errorMiddleware from './src/middleware/errorMiddleware.js';
import { AppError } from './src/errors/index.js';

/**
 * Configures the Express application with all middleware and routes
 * @param {Object} services - Initialized service instances (eg: DB, Mail, Payment)
 * @returns {Object} - Contains configured Express app and PORT
 */
async function configureApp(services) {
  const app = express();
  const { dbService } = services;

  // Required environment variables with fallbacks
  const PORT = process.env.PORT || 3000;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
  const CLIENT_URL_WWW = process.env.CLIENT_URL_WWW || 'http://www.localhost:3000';
  const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';

  // Load configuration from config/default.yaml
  const morganFormat = config.get('morganFormat'); // Format to log HTTP requests

  // CORS configuration for allowed origins
  const corsOptions = {
    ...config.get('cors'),
    origin: (origin, callback) => {
      // Replace template strings in CORS origins
      const allowedOrigins = config.get('cors.origins').map(o =>
        o.replace('${CLIENT_URL}', CLIENT_URL)
          .replace('${CLIENT_URL_WWW}', CLIENT_URL_WWW)
      );

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new AppError('Not allowed by CORS', 403));
    },
    credentials: true
  };

  // Session configuration with MongoDB store
  const sessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === 'production', // Secure in production only
      httpOnly: true,
      maxAge: config.get('cookie.maxAge')
    },
    store: dbService.createSessionStore()
  };

  // Other configuration options
  const rateLimitOptions = config.get('rateLimit');
  const requireHTTPS = config.get('requireHTTPS');
  const publicPrefix = config.get('routes.publicPrefix');
  const webhookPrefix = config.get('routes.webhookPrefix');
  const protectedPrefix = config.get('routes.protectedPrefix');

  // Security middleware
  app.use(helmet()); // Sets various HTTP headers for security
  app.use(cors(corsOptions)); // Cross-Origin Resource Sharing
  morganFormat !== 'none' && app.use(morgan(morganFormat)); // HTTP request logging
  app.use(cookieParser()); // Parse Cookie header
  app.use(session(sessionOptions)); // Session handling

  // Force HTTPS in production if required
  if (NODE_ENV === 'production' && requireHTTPS) {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.status(403).send('HTTPS is required');
      }
      next();
    });
  }

  // Route configuration with rate limiting
  app.use(rateLimit(rateLimitOptions));
  app.use(publicPrefix, publicRouter);     // Public routes (anyone can access)
  app.use(webhookPrefix, webhookRouter);   // Webhook routes (handles all responses to webhooks)
  app.use(protectedPrefix, protectedRouter); // Protected routes (require auth)

  // Global error handlers
  app.use('*', (req, res, next) => {
    next(new AppError(`404: ${req.baseUrl} is not found`, 404));
  });
  app.use(errorMiddleware);

  return { app, PORT };
}

/**
 * Initializes and starts the server
 * - Initializes required services (DB, Mail, Payment)
 * - Connects to MongoDB
 * - Configures Express app
 * - Sets up error handling
 */
async function startServer() {
  try {
    // Initialize all services defined in services/index.js
    const services = await initializeServices();
    console.log('Services initialized');

    // Establish MongoDB connection
    await services.dbService.connect();
    console.log('Connected to MongoDB');

    // Start Express server
    const { app, PORT } = await configureApp(services);
    app.listen(PORT, () => {
      console.log(`Server listening... [Port: ${PORT}]`);
    });

    // Global error handlers for unhandled errors
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...');
      console.error(err);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION! Shutting down...');
      console.error(err);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
