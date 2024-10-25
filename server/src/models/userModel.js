const { v4: uuid } = require('uuid');
const ModelService = require('../services/modelService');

class UserModel {
  #service;

  constructor() {
    this.#service = new ModelService('User', {
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

  async create(paymentCustomerId, paid = false) {
    try {
      const user = await this.#service.create({ paymentCustomerId, paid });
      return user;
    } catch (e) {
      throw e;
    }
  }

  async getWithAuthToken(authToken) {
    try {
      const user = await this.#service.getOne({ authToken });
      return user;
    } catch (e) {
      throw e;
    }
  }

  async verifyPaid(paymentCustomerId, email) {
    try {
      const user = await this.#service.updateOne(
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

module.exports = new UserModel();
