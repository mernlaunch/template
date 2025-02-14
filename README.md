# MERN SaaS Template

A modern, production-ready template for building SaaS applications with the MERN stack (MongoDB, Express, React, Node.js). Features built-in payment processing, authentication, and email integration.

## Features

- 💳 **Stripe Integration** - Accept one-time payments
- 📧 **Email Integration** - SendGrid-powered transactional emails
- 🔐 **Token Authentication** - Secure authentication flow
- 🗄️ **MongoDB Session Store** - Reliable session management
- ⚡ **Express Backend** - RESTful API with error handling
- ⚛️ **React Frontend** - Ready-to-style components
- 🛡️ **Security Features** - CORS, rate limiting, and more

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   └── styles/        # CSS styles
│   └── public/             # Static assets
└── server/                 # Express backend
    ├── config/             # Configuration files
    └── src/
        ├── errors/         # Custom errors
        ├── middleware/     # Express middleware
        ├── models/         # Database models
        ├── routes/         # API routes
        └── services/       # Core services
```

## Quick Start

1. **Install Dependencies**

   ```bash
   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd server && npm install
   ```

2. **Environment Setup**

   Create `.env` files in both client and server directories:

   `client/.env`:
   ```
   REACT_APP_API_URL=http://localhost:4000
   ```

   `server/.env`:
   ```
   NODE_ENV=development
   PORT=4000
   CLIENT_URL=http://localhost:3000
   SESSION_SECRET=your-secret-key
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   DB_URI=mongodb://localhost:27017/your-db
   SENDGRID_API_KEY=SG....
   ```

3. **Configure Application**

   Edit `default.yaml` to configure:
   - Rate limiting
   - CORS settings
   - Email templates
   - Route prefixes
   - Cookie settings
   - Which services are enabled
   - ...

4. **Start Development Servers**

   ```bash
   # Start backend (http://localhost:4000)
   cd server && npm run dev

   # Start frontend (http://localhost:3000)
   cd client && npm start
   ```

## Authentication Flow

1. User makes payment via Stripe
2. Payment webhook triggers email with auth token
3. User signs in with token from email
4. Session cookie maintains authentication

## Build Frontend for Production

```bash
cd client && npm run build
```

## Production Deployment

1. Set `NODE_ENV=production` in server
2. Configure production URLs
3. Build frontend with `npm run build`
4. Deploy server and built client

## License

This project is licensed under the Mozilla Public License 2.0 (MPL-2.0), which means:

### You are free to:
- ✅ Use the code commercially
- ✅ Modify the code
- ✅ Distribute the code
- ✅ Use the code privately

### You must:
- ⚠️ Include the original license and copyright notices
- ⚠️ Disclose your modifications to this source code
- ⚠️ License modifications under MPL-2.0
- ⚠️ Provide attribution to the original author (@charliedbtaylor)

### You do NOT need to:
- ❌ Make other parts of your application open source
- ❌ Pay any royalties or fees
- ❌ Submit your changes back to this repository
