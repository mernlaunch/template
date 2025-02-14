import users from '../models/userModel.js';
import { AppError } from '../errors/index.js';

/**
 * Authentication middleware for protected routes
 * Verifies that the sender of the request is authenticated
 * Authenticated users have a valid session with a userId (their ID in the database)
 * Used by the protectedRouter to guard access to member-only routes
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} 401 if no session or invalid user
 * @throws {AppError} 500 if authentication check fails
 */
export default async (req, res, next) => {
  try {
    // Verify that there is a userId in the session
    const { userId } = req.session;
    if (!userId) return next(new AppError('Authentication required', 401));

    // Verify the user exists in database
    const user = await users.getWithId(userId);
    if (!user) return next(new AppError('Authentication required', 401));

    // Authentication successful
    next();

  } catch (error) {
    next(new AppError('Authentication failed', 500, error))
  }
};
