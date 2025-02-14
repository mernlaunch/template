import Service from './Service.js';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';

/**
 * Class that allows you to get, create, update, and delete documents in a MongoDB collection
 * Provides CRUD operations with consistent error handling and parameter validation
 * @private
 */
class Model {
  #model;  // Mongoose model instance
  #name;   // Model name for error messages
  #service; // Parent DBService instance for error handling

  /**
   * Creates a new Model wrapper
   * @param {string} name - Model name
   * @param {mongoose.Schema} schema - Mongoose schema definition
   * @param {DBService} service - Instance of DBService
   */
  constructor(name, schema, service) {
    this.#name = name;
    this.#service = service;
    this.#model = mongoose.models[name] || mongoose.model(name, schema);
  }

  /**
   * Creates a new document in the database
   * @param {Object} data - Document data to create
   * @returns {Promise<mongoose.Document>} Created document
   * @throws {ServiceError} If creation fails or validation error
   */
  async create(data) {
    this.#service._validateParams({ data }, ['data']);
    try {
      const document = await this.#model.create(data);
      return document;
    } catch (e) {
      throw this.#service.createError(`Failed to create ${this.#name} document`, e);
    }
  }

  /**
   * Retrieves a single document matching query
   * @param {Object} query - MongoDB query object
   * @returns {Promise<mongoose.Document|null>} Found document or null
   * @throws {ServiceError} If query fails
   */
  async getOne(query) {
    this.#service._validateParams({ query }, ['query']);
    try {
      const document = await this.#model.findOne(query);
      return document;
    } catch (e) {
      throw this.#service.createError(`Failed to fetch ${this.#name} document`, e);
    }
  }

  /**
   * Retrieves multiple documents matching query
   * @param {Object} query - MongoDB query object
   * @returns {Promise<mongoose.Document[]>} Array of matching documents
   * @throws {ServiceError} If query fails
   */
  async getMany(query) {
    this.#service._validateParams({ query }, ['query']);
    try {
      const documents = await this.#model.find(query);
      return documents;
    } catch (e) {
      throw this.#service.createError(`Failed to fetch ${this.#name} documents`, e);
    }
  }

  /**
   * Updates a single document matching query
   * @param {Object} query - MongoDB query to find document
   * @param {Object} data - Update data
   * @returns {Promise<mongoose.Document|null>} Updated document or null
   * @throws {ServiceError} If update fails
   */
  async updateOne(query, data) {
    this.#service._validateParams({ query, data }, ['query', 'data']);
    try {
      const document = await this.#model.findOneAndUpdate(query, data, { new: true });
      return document;
    } catch (e) {
      throw this.#service.createError(`Failed to update ${this.#name} document`, e);
    }
  }

  /**
   * Updates multiple documents matching query
   * @param {Object} query - MongoDB query to find documents
   * @param {Object} data - Update data
   * @returns {Promise<Object>} MongoDB update result
   * @throws {ServiceError} If update fails
   */
  async updateMany(query, data) {
    this.#service._validateParams({ query, data }, ['query', 'data']);
    try {
      const outcome = await this.#model.updateMany(query, data);
      return outcome;
    } catch (e) {
      throw this.#service.createError(`Failed to update ${this.#name} documents`, e);
    }
  }

  /**
   * Deletes a single document matching query
   * @param {Object} query - MongoDB query to find document
   * @returns {Promise<Object>} MongoDB delete result
   * @throws {ServiceError} If deletion fails
   */
  async deleteOne(query) {
    this.#service._validateParams({ query }, ['query']);
    try {
      const outcome = await this.#model.deleteOne(query);
      return outcome;
    } catch (e) {
      throw this.#service.createError(`Failed to delete ${this.#name} document`, e);
    }
  }

  /**
   * Deletes multiple documents matching query
   * @param {Object} query - MongoDB query to find documents
   * @returns {Promise<Object>} MongoDB delete result
   * @throws {ServiceError} If deletion fails
   */
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

/**
 * Database service for MongoDB operations
 * Handles database connections, model creation, and session store management
 * @extends Service
 */
export default class DBService extends Service {
  /**
   * Creates new DBService instance
   * @param {string} URI - MongoDB connection URI
   * @param {string} sessionCollection - Collection name for storing sessions
   */
  constructor(URI, sessionCollection) {
    // Initialize the parent class, setting the `requiredConfig` property
    super({ URI, sessionCollection });
  }

  /**
   * Establishes MongoDB connection
   * @throws {ServiceError} If connection fails
   */
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

  /**
   * Closes MongoDB connection
   * @throws {ServiceError} If disconnection fails
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
    } catch (e) {
      throw this.createError('Failed to disconnect from database', e);
    }
  }

  /**
   * Creates a new Model class to interact with a MongoDB collection
   * @param {string} name - Model name
   * @param {Object} schemaOptions - Mongoose schema definition
   * @returns {Model} Wrapped Mongoose model
   * @throws {ServiceError} If model creation fails
   */
  createModel(name, schemaOptions = {}) {
    this._validateParams({ name }, ['name']);

    try {
      const schema = new mongoose.Schema(schemaOptions);
      return new Model(name, schema, this);
    } catch (e) {
      throw this.createError(`Failed to create ${name} model`, e);
    }
  }

  /**
   * Creates MongoDB session store for Express
   * @returns {MongoStore} Configured session store
   * @throws {ServiceError} If store creation fails
   */
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
