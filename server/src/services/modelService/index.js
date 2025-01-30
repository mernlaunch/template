import mongoose from 'mongoose';
import { AppError } from '../../errors/index.js';

/**
 * Service class for interacting with MongoDB models.
 */
export default class ModelService {
  /**
   * Creates an instance of ModelService.
   * @param {string} name - The name of the model.
   * @param {Object} schemaOptions - The schema definition for the model.
   */
  constructor(name, schemaOptions) {
    this.name = name;
    this.schema = new mongoose.Schema(schemaOptions);
    this.Model = mongoose.models[this.name] || mongoose.model(this.name, this.schema);
  }

  /**
   * Create a new document.
   * @param {Object} data - The data to create the document with.
   * @returns {Promise<Object>} The created document.
   * @throws {Error} If there is an error creating the document.
   */
  async create(data) {
    try {
      const document = await this.Model.create(data);
      return document;
    } catch (e) {
      throw new AppError(`Failed to create ${this.name} document`, 500, e);
    }
  }

  /**
   * Get a single document based on a query.
   * @param {Object} query - The query to find the document.
   * @returns {Promise<Object>} The retrieved document.
   * @throws {Error} If there is an error retrieving the document.
   */
  async getOne(query) {
    try {
      const document = await this.Model.findOne(query);
      return document;
    } catch (e) {
      throw new AppError(`Failed to fetch ${this.name} document`, 500, e);
    }
  }

  /**
   * Get multiple documents based on a query.
   * @param {Object} query - The query to find the documents.
   * @returns {Promise<Array<Object>>} The retrieved documents.
   * @throws {Error} If there is an error retrieving the documents.
   */
  async getMany(query) {
    try {
      const documents = await this.Model.find(query);
      return documents;
    } catch (e) {
      throw new AppError(`Failed to fetch ${this.name} document`, 500, e);
    }
  }

  /**
   * Update a single document based on a query.
   * @param {Object} query - The query to find the document.
   * @param {Object} data - The data to update the document with.
   * @returns {Promise<Object>} The updated document.
   * @throws {Error} If there is an error updating the document.
   */
  async updateOne(query, data) {
    try {
      const document = await this.Model.findOneAndUpdate(query, data, { new: true });
      return document;
    } catch (e) {
      throw new AppError(`Failed to update ${this.name} document`, 500, e);
    }
  }

  /**
   * Update multiple documents based on a query.
   * @param {Object} query - The query to find the documents.
   * @param {Object} data - The data to update the documents with.
   * @returns {Promise<Object>} The outcome data.
   * @throws {Error} If there is an error updating the documents.
   */
  async updateMany(query, data) {
    try {
      const outcome = await this.Model.updateMany(query, data);
      return outcome;
    } catch (e) {
      throw new AppError(`Failed to update ${this.name} document`, 500, e);
    }
  }

  /**
   * Delete a single document based on a query.
   * @param {Object} query - The query to find the document.
   * @returns {Promise<Object>} The outcome data.
   * @throws {Error} If there is an error deleting the document.
   */
  async deleteOne(query) {
    try {
      const outcome = await this.Model.deleteOne(query);
      return outcome;
    } catch (e) {
      throw new AppError(`Failed to delete ${this.name} document`, 500, e);
    }
  }

  /**
   * Delete multiple documents based on a query.
   * @param {Object} query - The query to find the documents.
   * @returns {Promie<Object>} The outcome data.
   * @throws {Error} If there is an error deleting the documents.
   */
  async deleteMany(query) {
    try {
      const outcome = await this.Model.deleteMany(query);
      return outcome;
    } catch (e) {
      throw new AppError(`Failed to delete ${this.name} document`, 500, e);
    }
  }
};
