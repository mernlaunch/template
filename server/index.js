require('dotenv').config();
const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const routes = require('./src/routes');
const errorMiddleware = require('./src/middleware/errorMiddleware');

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
  }
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
app.use(publicPrefix, routes.publicRouter);
app.use(webhookPrefix, routes.webhookRouter);
app.use(protectedPrefix, routes.protectedRouter);
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server listening... [Port: ${PORT}]`);

  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

  } catch (e) {
    console.error('Failed to connect to MongoDB', e);
  }
});
