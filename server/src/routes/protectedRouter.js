import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

const protectedRouter = express.Router();
protectedRouter.use(authMiddleware);

protectedRouter.get('/test-data', (req, res) => {
  res.json({ message: 'Only paid members can access this info!' });
});

export default protectedRouter;
