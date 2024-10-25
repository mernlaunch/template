import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

async function createCheckoutSession() {
  try {
    const response = await api.post('/public/checkout-session');
    return response.data;

  } catch (e) {
    throw new Error('Failed to create checkout session');
  }
};

async function authenticate(token) {
  try {
    const response = await api.post('/public/authenticate', null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;

  } catch (e) {
    throw new Error('Failed to authenticate');
  }
}

async function deauthenticate() {
  try {
    await api.post('/public/deauthenticate');
    return true;

  } catch (e) {
    throw new Error('Failed to deauthenticate');
  }
}

async function getTestData() {
  try {
    const response = await api.get('/protected/test-data');
    return response.data;

  } catch (e) {
    if (e.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to get test data');
  }
}

export default { createCheckoutSession, authenticate, deauthenticate, getTestData };
