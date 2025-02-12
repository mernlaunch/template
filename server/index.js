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

async function configureApp(services) {
  const app = express();
  const { dbService } = services;

  // Environment variables
  const PORT = process.env.PORT || 3000;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
  const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';

  // Configuration
  const morganFormat = config.get('morganFormat');
  const corsOptions = {
    ...config.get('cors'),
    origin: config.get('cors').origin.replace('${CLIENT_URL}', CLIENT_URL),
    credentials: true
  };
  const sessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === 'production',
      httpOnly: true,
      maxAge: config.get('cookie.maxAge')
    },
    store: dbService.createSessionStore()
  };
  const rateLimitOptions = config.get('rateLimit');
  const requireHTTPS = config.get('requireHTTPS');
  const publicPrefix = config.get('routes.publicPrefix');
  const webhookPrefix = config.get('routes.webhookPrefix');
  const protectedPrefix = config.get('routes.protectedPrefix');

  // Middleware
  app.use(helmet());
  app.use(cors(corsOptions));
  morganFormat !== 'none' && app.use(morgan(morganFormat));
  app.use(cookieParser());
  app.use(session(sessionOptions));

  // Production HTTPS requirement
  if (NODE_ENV === 'production' && requireHTTPS) {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.status(403).send('HTTPS is required');
      }
      next();
    });
  }

  // Routes
  app.use(rateLimit(rateLimitOptions));
  app.use(publicPrefix, publicRouter);
  app.use(webhookPrefix, webhookRouter);
  app.use(protectedPrefix, protectedRouter);

  // 404 handler
  app.use('*', (req, res, next) => {
    next(new AppError(`404: ${req.baseUrl} is not found`, 404));
  });

  // Error handler
  app.use(errorMiddleware);

  return { app, PORT };
}

async function startServer() {
  try {
    // Initialize services first
    const services = await initializeServices();
    console.log('Services initialized');

    // Connect to database
    await services.dbService.connect();
    console.log('Connected to MongoDB');

    // Configure and start express app
    const { app, PORT } = await configureApp(services);
    app.listen(PORT, () => {
      console.log(`Server listening... [Port: ${PORT}]`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...');
      console.error(err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
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
