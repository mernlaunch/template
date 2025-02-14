import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

/**
 * Express router for protected routes
 * All routes require authentication via [`authMiddleware`](server/src/middleware/authMiddleware.js)
 * Accessed through the /protected prefix (configurable in server/config/default.yaml)
 */
const protectedRouter = express.Router();

// Apply authentication middleware to all routes
protectedRouter.use(authMiddleware);

/**
 * Test endpoint to verify authentication
 * @route GET /protected/test-data
 * @returns {Object} JSON with test message
 * @throws {AppError} 401 if not authenticated
 */
protectedRouter.get('/test-data', (req, res) => {
  res.status(200).json({ message: 'Only paid members can access this message!' });
});

export default protectedRouter;
