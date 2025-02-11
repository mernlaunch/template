import 'dotenv/config';
import express from 'express';
import config from 'config';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import helmet from 'helmet';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import publicRouter from './src/routes/publicRouter.js';
import protectedRouter from './src/routes/protectedRouter.js';
import webhookRouter from './src/routes/webhookRouter.js';
import errorMiddleware from './src/middleware/errorMiddleware.js';
import { initializeServices } from './src/services/index.js';

const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
const app = express();

const morganFormat = config.get('morganFormat');
const corsOptions = {
  ...config.get('cors'),
  origin: config.get('cors').origin
    .replace('${CLIENT_URL}', CLIENT_URL),
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
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI,
    collectionName: 'sessions'
  })
};
const rateLimitOptions = config.get('rateLimit');
const requireHTTPS = config.get('requireHTTPS');
const publicPrefix = config.get('routes.publicPrefix');
const webhookPrefix = config.get('routes.webhookPrefix');
const protectedPrefix = config.get('routes.protectedPrefix');

app.use(helmet());
app.use(cors(corsOptions));
morganFormat !== 'none' && app.use(morgan(morganFormat));
app.use(cookieParser());
app.use(session(sessionOptions));

// ensure HTTPS in production
NODE_ENV === 'production' && requireHTTPS
  && app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.status(403).send('HTTPS is required');
    }
    next();
  });

app.use(rateLimit(rateLimitOptions));
app.use(publicPrefix, publicRouter);
app.use(webhookPrefix, webhookRouter);
app.use(protectedPrefix, protectedRouter);
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server listening... [Port: ${PORT}]`);

  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
    initializeServices();
    console.log('Services initialized');

  } catch (e) {
    console.error('Failed to connect to MongoDB', e);
  }
});
