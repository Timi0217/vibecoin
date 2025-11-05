/**
 * API client for VibeCoin backend
 */

const axios = require('axios');
const config = require('../utils/config');
const { API_TIMEOUT } = require('../utils/constants');

/**
 * Create axios instance with default config
 */
function createClient() {
  const instance = axios.create({
    baseURL: config.getApiUrl(),
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add auth token to requests
  instance.interceptors.request.use((requestConfig) => {
    const token = config.getAuthToken();
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  });

  // Handle response errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        config.clearAuth();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

const client = createClient();

/**
 * Authentication API
 */
const auth = {
  /**
   * Login with credentials
   * @param {object} credentials - Login credentials
   * @returns {Promise<object>} Auth response
   */
  async login(credentials) {
    const response = await client.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout
   * @returns {Promise<void>}
   */
  async logout() {
    const response = await client.post('/api/auth/logout');
    return response.data;
  },

  /**
   * Get current user
   * @returns {Promise<object>} User object
   */
  async me() {
    const response = await client.get('/api/auth/me');
    return response.data;
  }
};

/**
 * Tasks API
 */
const tasks = {
  /**
   * Get next available task
   * @returns {Promise<object>} Task object
   */
  async getNext() {
    const response = await client.get('/api/tasks/next');
    return response.data;
  },

  /**
   * Submit task answer
   * @param {string} taskId - Task ID
   * @param {object} answer - Answer data
   * @returns {Promise<object>} Submission result
   */
  async submit(taskId, answer) {
    const response = await client.post(`/api/tasks/${taskId}/submit`, answer);
    return response.data;
  },

  /**
   * Get task history
   * @param {object} params - Query parameters
   * @returns {Promise<Array>} Task history
   */
  async getHistory(params = {}) {
    const response = await client.get('/api/tasks/history', { params });
    return response.data;
  }
};

/**
 * Earnings API
 */
const earnings = {
  /**
   * Get total earnings
   * @returns {Promise<object>} Earnings data
   */
  async get() {
    const response = await client.get('/api/earnings');
    return response.data;
  },

  /**
   * Get detailed stats
   * @returns {Promise<object>} Earnings stats
   */
  async getStats() {
    const response = await client.get('/api/earnings/stats');
    return response.data;
  }
};

/**
 * Payouts API
 */
const payouts = {
  /**
   * Request payout
   * @param {object} payoutData - Payout request data
   * @returns {Promise<object>} Payout response
   */
  async request(payoutData) {
    const response = await client.post('/api/payouts/request', payoutData);
    return response.data;
  },

  /**
   * Get payout history
   * @returns {Promise<Array>} Payout history
   */
  async getHistory() {
    const response = await client.get('/api/payouts/history');
    return response.data;
  }
};

module.exports = {
  auth,
  tasks,
  earnings,
  payouts,
  client
};
