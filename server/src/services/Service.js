/**
 * Custom error class for service-related errors
 * Exactly the same as a regular Error, but with a `serviceName` and `originalError` property
 */
class ServiceError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} serviceName - Name of the service where error occurred
   * @param {Error|null} originalError - Original error object if this wraps another error
   */
  constructor(message, serviceName, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.serviceName = serviceName;
    this.originalError = originalError;
  }
}

/**
 * Base Service class that all services extend from
 * Provides common functionality for configuration management and error handling
 * For example, DBService, and PaymentService inherit from this class.
 */
export default class Service {
  /**
   * Creates a new service instance with required configuration
   * @param {Object} requiredConfig - Key-value pairs of required configuration
   * @throws {ServiceError} If any required configuration is missing or empty
   */
  constructor(requiredConfig = {}) {
    this.serviceName = this.constructor.name;

    // Store all config values as private fields using # prefix
    for (const [key, value] of Object.entries(requiredConfig)) {
      if (!value || value === '') {
        // If you receive this error, it means that one of the configuration values (in the constructor) is missing or empty
        throw this.createError(`Missing required config: ${key}`);
      }
      this[`#${key}`] = value;
    }
  }

  /**
   * Creates a service-specific error
   * @param {string} message - Error message
   * @param {Error|null} originalError - Original error if wrapping another error
   * @returns {ServiceError} New error instance with service context
   */
  createError(message, originalError = null) {
    return new ServiceError(message, this.serviceName, originalError);
  }

  /**
   * Gets a configuration value by key from private fields
   * Every key-value pair from `requiredConfig` in the constructor can be accessed using this method
   * @param {string} key - Configuration key to retrieve
   * @returns {any} Configuration value
   * @protected
   */
  _getConfig(key) {
    return this[`#${key}`];
  }

  /**
   * Validates that required parameters are defined
   * @param {Object} params - Parameters to validate
   * @param {string[]} requiredParams - List of required parameter names
   * @throws {ServiceError} If any required parameters are missing
   * @protected
   */
  _validateParams(params, requiredParams) {
    const missing = requiredParams.filter(param => !params[param]);
    if (missing.length > 0) {
      throw this.createError(`Missing required parameters: ${missing.join(', ')}`);
    }
  }
}
