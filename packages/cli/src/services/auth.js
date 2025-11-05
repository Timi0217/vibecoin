/**
 * Authentication service
 */

const open = require('open');
const api = require('./api');
const config = require('../utils/config');
const chalk = require('chalk');

/**
 * Generate auth URL for browser-based OAuth flow
 * @returns {string} Auth URL
 */
function getAuthUrl() {
  const baseUrl = config.getApiUrl();
  const callbackUrl = 'http://localhost:3737/callback';
  return `${baseUrl}/auth/cli?callback=${encodeURIComponent(callbackUrl)}`;
}

/**
 * Start OAuth flow
 * For MVP, we'll use a simpler token-based auth
 * @returns {Promise<object>} Auth result
 */
async function startAuthFlow() {
  console.log(chalk.blue('\n🔐 Opening browser for authentication...\n'));

  // For MVP: Simple token-based auth
  // In production, this would open browser and start OAuth flow
  const authUrl = getAuthUrl();

  try {
    await open(authUrl);
    return { success: true };
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Could not open browser automatically'));
    console.log(chalk.cyan(`\nPlease open this URL in your browser:\n${authUrl}\n`));
    return { success: true };
  }
}

/**
 * Login with email/password (MVP simplified auth)
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Login result
 */
async function login(email, password) {
  try {
    const response = await api.auth.login({ email, password });

    // Store auth token and user data
    config.setAuthToken(response.token);
    config.setUser(response.user);

    return {
      success: true,
      user: response.user,
      token: response.token
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Logout
 * @returns {Promise<object>} Logout result
 */
async function logout() {
  try {
    // Call logout endpoint
    await api.auth.logout();
  } catch (error) {
    // Even if API call fails, clear local auth
    console.log(chalk.yellow('⚠️  API logout failed, clearing local session'));
  }

  // Clear local auth data
  config.clearAuth();

  return { success: true };
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
function isAuthenticated() {
  return config.isAuthenticated();
}

/**
 * Get current user
 * @returns {object|null} User object
 */
function getCurrentUser() {
  return config.getUser();
}

/**
 * Verify authentication with server
 * @returns {Promise<object>} Verification result
 */
async function verifyAuth() {
  try {
    const user = await api.auth.me();
    config.setUser(user);
    return { success: true, user };
  } catch (error) {
    config.clearAuth();
    return {
      success: false,
      error: 'Authentication failed. Please login again.'
    };
  }
}

/**
 * Require authentication (throws if not authenticated)
 * @throws {Error} If not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated. Please run "vibecoin login" first.');
  }
}

module.exports = {
  getAuthUrl,
  startAuthFlow,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  verifyAuth,
  requireAuth
};
