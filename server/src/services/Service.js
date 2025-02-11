class ServiceError extends Error {
  constructor(message, serviceName, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.serviceName = serviceName;
    this.originalError = originalError;
  }
}

export default class Service {
  constructor(requiredConfig = {}) {
    this.serviceName = this.constructor.name;

    for (const [key, value] of Object.entries(requiredConfig)) {
      if (!value || value === '') {
        throw this.createError(`Missing required config: ${key}`);
      }
      this[`#${key}`] = value;
    }
  }

  createError(message, originalError = null) {
    return new ServiceError(message, this.serviceName, originalError);
  }

  _getConfig(key) {
    return this[`#${key}`];
  }

  _validateParams(params, requiredParams) {
    const missing = requiredParams.filter(param => !params[param]);
    if (missing.length > 0) {
      throw this.createError(`Missing required parameters: ${missing.join(', ')}`);
    }
  }
}
