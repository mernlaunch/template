import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

class API {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true
    });
  }

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

  async isAuthenticated() {
    return this.#request('get', '/public/is-authenticated');
  }

  async authenticate(token) {
    return this.#request('post', '/public/authenticate', {
      data: null,
      config: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });
  }

  async deauthenticate() {
    await this.#request('post', '/public/deauthenticate');
    return true;
  }

  async createCheckoutSession() {
    return this.#request('post', '/public/checkout-session');
  }

  async getTestData() {
    return this.#request('get', '/protected/test-data');
  }
}

const api = new API();
export default api;
