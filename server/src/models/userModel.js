import { v4 as uuid } from 'uuid';
import { dbService } from '../services/index.js';
import { AppError } from '../errors/index.js';

/**
 * User model for managing user data in MongoDB
 * Handles user creation, retrieval, and payment verification
 * Uses the Model wrapper from DBService for database operations
 * All other models should follow a similar structure: a class with methods for database operations, using the Model wrapper and exporting an instance of the class
 */
class UserModel {
  /** @private Wrapped Mongoose model instance */
  #model;

  /**
   * Creates User model with MongoDB schema
   * @throws {AppError} If model creation fails
   */
  constructor() {
    try {
      this.#model = dbService.createModel('User', {
        // Stripe customer ID for payment tracking
        paymentCustomerId: {
          type: String,
          required: true,
          unique: true,
        },
        // Whether user has completed payment
        paid: {
          type: Boolean,
          default: false,
        },
        // User's email from Stripe checkout
        email: {
          type: String,
          default: null,
          unique: false,
        },
        // Authentication token sent via email
        authToken: {
          type: String,
          default: undefined,
          unique: true,
          sparse: true, // Allows null values while maintaining uniqueness
        }
      });
    } catch (e) {
      throw new AppError('Failed to create User model', 500, e);
    }
  }

  /**
   * Gets user by MongoDB document ID
   * @param {string} id - MongoDB document ID
   * @returns {Promise<Object|null>} User document or null
   * @throws {AppError} If database query fails
   */
  async getWithId(id) {
    try {
      const user = await this.#model.getOne({ _id: id });
      return user;
    } catch (e) {
      throw new AppError('Failed to get user', 500, e);
    }
  }

  /**
   * Creates new user with Stripe customer ID
   * This is done when a user creates a checkout
   * @param {string} paymentCustomerId - Stripe customer ID
   * @param {boolean} paid - Whether payment is completed
   * @returns {Promise<Object>} Created user document
   * @throws {AppError} If user creation fails
   */
  async create(paymentCustomerId, paid = false) {
    try {
      const user = await this.#model.create({ paymentCustomerId, paid });
      return user;
    } catch (e) {
      throw new AppError('Failed to create user', 500, e);
    }
  }

  /**
   * Gets user by authentication token
   * @param {string} authToken - Token sent via email after payment
   * @returns {Promise<Object|null>} User document or null
   * @throws {AppError} If database query fails
   */
  async getWithAuthToken(authToken) {
    try {
      const user = await this.#model.getOne({ authToken });
      return user;
    } catch (e) {
      throw new AppError('Failed to get user', 500, e);
    }
  }

  /**
   * Marks user as paid and generates auth token
   * Called when Stripe webhook confirms payment
   * @param {string} paymentCustomerId - Stripe customer ID
   * @param {string} email - User's email from Stripe checkout
   * @returns {Promise<Object|null>} Updated user document or null
   * @throws {AppError} If update fails
   */
  async verifyPaid(paymentCustomerId, email) {
    try {
      const user = await this.#model.updateOne(
        { paymentCustomerId },
        {
          email,
          paid: true,
          authToken: uuid()
        }
      );
      return user;
    } catch (e) {
      throw new AppError('Failed to update user', 500, e);
    }
  }
}

// Export singleton instance
export default new UserModel();
