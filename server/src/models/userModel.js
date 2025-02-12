import { v4 as uuid } from 'uuid';
import { dbService } from '../services/index.js';
import { AppError } from '../errors/index.js';

class UserModel {
  #model;

  constructor() {
    try {
      this.#model = dbService.createModel('User', {
        paymentCustomerId: {
          type: String,
          required: true,
          unique: true,
        },
        paid: {
          type: Boolean,
          default: false,
        },
        email: {
          type: String,
          default: null,
          unique: false,
        },
        authToken: {
          type: String,
          default: undefined,
          unique: true,
          sparse: true,
        }
      });
    } catch (e) {
      throw new AppError('Failed to create User model', 500, e);
    }
  }

  async getWithId(id) {
    try {
      const user = await this.#model.getOne({ _id: id });
      return user;
    } catch (e) {
      throw new AppError('Failed to get user', 500, e);
    }
  }

  async create(paymentCustomerId, paid = false) {
    try {
      const user = await this.#model.create({ paymentCustomerId, paid });
      return user;
    } catch (e) {
      throw new AppError('Failed to create user', 500, e);
    }
  }

  async getWithAuthToken(authToken) {
    try {
      const user = await this.#model.getOne({ authToken });
      return user;
    } catch (e) {
      throw new AppError('Failed to get user', 500, e);
    }
  }

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

export default new UserModel();
