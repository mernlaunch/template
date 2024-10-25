Thank's for purchasing the early release of this MERN SaaS template!

This template includes everything you need to set up a simple MERN-stack SaaS application. It includes a simple account system, stripe integration (for 1-time payment products), server configuration, a front-end that is ready to be styled, and more.

It is perfect for someone who is fimilar with React and Express, but wants to save time on setting up the basics of a SaaS application. Don't re-invent the wheel :)

There are two folders. /client contains a create-react-app application, and /server contains an express server.

Here are the steps to get it up and running:

1. `npm i` - cd into both /client and /server, and run npm i to install necessary node packages.
2. `.env` - create a .env file at the root of both /client and /server. Here are all the environment variables that must be specified to ensure proper functionaility:

  /client/.env
  `REACT_APP_API_URL`: The URL of the server. Should not include a last /. e.g. http://localhost:4000

  /server/.env
  `NODE_ENV`: e.g. production, development
  
  `PORT`
  
  `CLIENT_URL`: e.g.http://localhost:3000
  
  `SESSION_SECRET`
  
  `STRIPE_SECRET_KEY`: API key for Stripe (e.g. sk_test_51OAsk...)
  
  `STRIPE_PRICE_ID`: ID of the product your SaaS sells (e.g. price_1Q96dRA...)
  
  `STRIPE_WEBHOOK_SECRET`: The secret that identifies real Stripe webhooks (from Stripe dashboard) (e.g. whsec_134377f57c3e...)
  
  `DB_URI`: The URI of your MongoDB database (e.g. mongodb://localhost:27017/saas)
  
  `SENDGRID_API_KEY`: API key for SendGrid (e.g. SG.8fj...)

3. `server config` - in server/config/default.yaml there are a few configuration options that you can change. For example, you can adjust the rate limits, route prefixes, stripe success/cancel routes, confirmation email content, email address, etc. Have a look through and add any information your SaaS needs.

4. `start` - in /server run `npm run dev` to start the server. In /client run `npm start` to start the client.

If you have any questions, queries, or suggestions, feel free to reach out to me on X: @charliedbtaylor

I'll be updating this template regularly, adding features, fixing bugs, and improving the documentation. If you have any suggestions, please let me know!
