import { v4 as uuid } from 'uuid';
import { dbService } from '../services/index.js';

class UserModel {
  #model;

  constructor() {
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
  }

  async getWithId(id) {
    try {
      const user = await this.#model.getOne({ _id: id });
      return user;
    } catch (e) {
      throw e;
    }
  }

  async create(paymentCustomerId, paid = false) {
    try {
      const user = await this.#model.create({ paymentCustomerId, paid });
      return user;
    } catch (e) {
      throw e;
    }
  }

  async getWithAuthToken(authToken) {
    try {
      const user = await this.#model.getOne({ authToken });
      return user;
    } catch (e) {
      throw e;
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
      throw e;
    }
  }
}

export default new UserModel();
