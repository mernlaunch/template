import axios from 'axios';

/**
 * Base URL for API requests
 * Configurable via REACT_APP_API_URL environment variable
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * API client for communicating with the backend server
 * Handles all HTTP requests with consistent error handling
 */
class API {
  /**
   * Creates new API instance with configured axios client
   * Sets up base URL and enables credentials for auth
   */
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true // Required for session cookies
    });
  }

  /**
   * Makes an HTTP request with error handling
   * @param {string} method - HTTP method (get, post, etc)
   * @param {string} url - API endpoint
   * @param {Object} options - Request options (data, headers, etc)
   * @returns {Promise<any>} Response data from server
   * @private
   */
  async #request(method, url, options = {}) {
    try {
      const response = await this.client[method](url, ...Object.values(options));
      return response.data;
    } catch (e) {
      if (e.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(`API Error: ${e.message}`);
    }
  }

  /**
   * Checks if user is authenticated
   * Used by [`ProtectedPage`](client/src/components/ProtectedPage.jsx)
   * @returns {Promise<Object>} Authentication status
   */
  async isAuthenticated() {
    return this.#request('get', '/public/is-authenticated');
  }

  /**
   * Authenticates user with token from email
   * Used by [`SignInPage`](client/src/components/pages/SignInPage.jsx)
   * @param {string} token - Auth token received via email
   * @returns {Promise<Object>} Success message
   */
  async authenticate(token) {
    return this.#request('post', '/public/authenticate', {
      data: null,
      config: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });
  }

  /**
   * Removes user's session
   * Used by [`DashboardPage`](client/src/components/pages/DashboardPage.jsx)
   * @returns {Promise<boolean>} Always true
   */
  async deauthenticate() {
    await this.#request('post', '/public/deauthenticate');
    return true;
  }

  /**
   * Creates Stripe checkout session
   * Used by [`LandingPage`](client/src/components/pages/LandingPage.jsx)
   * @returns {Promise<Object>} Contains checkout URL
   */
  async createCheckoutSession() {
    return this.#request('post', '/public/checkout-session');
  }

  /**
   * Gets test data from protected endpoint
   * Used by [`DashboardPage`](client/src/components/pages/DashboardPage.jsx)
   * @returns {Promise<Object>} Test data
   */
  async getTestData() {
    return this.#request('get', '/protected/test-data');
  }
}

// Export singleton instance
const api = new API();
export default api;
