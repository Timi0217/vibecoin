/**
 * Configuration management
 * Handles storing and retrieving user configuration
 */

const Conf = require('conf');
const path = require('path');
const os = require('os');

// Create config instance
const config = new Conf({
  projectName: 'vibecoin',
  configName: 'config',
  cwd: path.join(os.homedir(), '.vibecoin'),
  defaults: {
    apiUrl: process.env.VIBECOIN_API_URL || 'https://api.vibecoin.sh',
    authToken: null,
    user: null,
    autoStart: false,
    notifications: true,
    lastSync: null
  }
});

/**
 * Get configuration value
 * @param {string} key - Configuration key
 * @returns {*} Configuration value
 */
function get(key) {
  return config.get(key);
}

/**
 * Set configuration value
 * @param {string} key - Configuration key
 * @param {*} value - Configuration value
 */
function set(key, value) {
  config.set(key, value);
}

/**
 * Delete configuration value
 * @param {string} key - Configuration key
 */
function deleteKey(key) {
  config.delete(key);
}

/**
 * Get all configuration
 * @returns {object} All configuration
 */
function getAll() {
  return config.store;
}

/**
 * Clear all configuration
 */
function clear() {
  config.clear();
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
function isAuthenticated() {
  const token = get('authToken');
  return token !== null && token !== undefined;
}

/**
 * Get auth token
 * @returns {string|null} Auth token
 */
function getAuthToken() {
  return get('authToken');
}

/**
 * Set auth token
 * @param {string} token - Auth token
 */
function setAuthToken(token) {
  set('authToken', token);
}

/**
 * Get current user
 * @returns {object|null} User object
 */
function getUser() {
  return get('user');
}

/**
 * Set current user
 * @param {object} user - User object
 */
function setUser(user) {
  set('user', user);
}

/**
 * Clear authentication
 */
function clearAuth() {
  deleteKey('authToken');
  deleteKey('user');
}

/**
 * Get API URL
 * @returns {string} API URL
 */
function getApiUrl() {
  return get('apiUrl');
}

/**
 * Get Web URL for task viewing
 * @returns {string} Web URL
 */
function getWebUrl() {
  // Allow override via environment variable
  if (process.env.VIBECOIN_WEB_URL) {
    return process.env.VIBECOIN_WEB_URL;
  }

  const apiUrl = getApiUrl();

  // For production: convert api.vibecoin.sh -> tasks.vibecoin.sh
  if (apiUrl.includes('api.vibecoin.sh')) {
    return apiUrl.replace('api.vibecoin.sh', 'tasks.vibecoin.sh');
  }

  // For localhost development: use same host
  if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
    return apiUrl;
  }

  // Default fallback
  return apiUrl;
}

module.exports = {
  get,
  set,
  delete: deleteKey,
  getAll,
  clear,
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  getUser,
  setUser,
  clearAuth,
  getApiUrl,
  getWebUrl
};
