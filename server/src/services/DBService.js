import Service from './Service.js';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';

class Model {
  #model;
  #name;
  #service;

  constructor(name, schema, service) {
    this.#name = name;
    this.#service = service;
    this.#model = mongoose.models[name] || mongoose.model(name, schema);
  }

  async create(data) {
    this.#service._validateParams({ data }, ['data']);
    try {
      const document = await this.#model.create(data);
      return document;
    } catch (e) {
      throw this.#service.createError(`Failed to create ${this.#name} document`, e);
    }
  }

  async getOne(query) {
    this.#service._validateParams({ query }, ['query']);
    try {
      const document = await this.#model.findOne(query);
      return document;
    } catch (e) {
      throw this.#service.createError(`Failed to fetch ${this.#name} document`, e);
    }
  }

  async getMany(query) {
    this.#service._validateParams({ query }, ['query']);
    try {
      const documents = await this.#model.find(query);
      return documents;
    } catch (e) {
      throw this.#service.createError(`Failed to fetch ${this.#name} documents`, e);
    }
  }

  async updateOne(query, data) {
    this.#service._validateParams({ query, data }, ['query', 'data']);
    try {
      const document = await this.#model.findOneAndUpdate(query, data, { new: true });
      return document;
    } catch (e) {
      throw this.#service.createError(`Failed to update ${this.#name} document`, e);
    }
  }

  async updateMany(query, data) {
    this.#service._validateParams({ query, data }, ['query', 'data']);
    try {
      const outcome = await this.#model.updateMany(query, data);
      return outcome;
    } catch (e) {
      throw this.#service.createError(`Failed to update ${this.#name} documents`, e);
    }
  }

  async deleteOne(query) {
    this.#service._validateParams({ query }, ['query']);
    try {
      const outcome = await this.#model.deleteOne(query);
      return outcome;
    } catch (e) {
      throw this.#service.createError(`Failed to delete ${this.#name} document`, e);
    }
  }

  async deleteMany(query) {
    this.#service._validateParams({ query }, ['query']);
    try {
      const outcome = await this.#model.deleteMany(query);
      return outcome;
    } catch (e) {
      throw this.#service.createError(`Failed to delete ${this.#name} documents`, e);
    }
  }
}

export default class DBService extends Service {
  constructor(URI, sessionCollection) {
    super({ URI, sessionCollection });
  }

  async connect() {
    try {
      await mongoose.connect(this._getConfig('URI'));
      mongoose.connection.on('error', (e) => {
        throw this.createError('Database connection error', e);
      });
    } catch (e) {
      throw this.createError('Failed to connect to the database', e);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
    } catch (e) {
      throw this.createError('Failed to disconnect from database', e);
    }
  }

  createModel(name, schemaOptions = {}) {
    this._validateParams({ name }, ['name']);

    try {
      const schema = new mongoose.Schema(schemaOptions);
      return new Model(name, schema, this);
    } catch (e) {
      throw this.createError(`Failed to create ${name} model`, e);
    }
  }

  createSessionStore() {
    try {
      const store = MongoStore.create({
        mongoUrl: this._getConfig('URI'),
        collectionName: this._getConfig('sessionCollection')
      });
      return store;
    } catch (e) {
      throw this.createError('Failed to create session store', e);
    }
  }
}
