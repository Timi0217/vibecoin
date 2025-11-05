/**
 * Earnings command - Display detailed earnings breakdown
 */

const ora = require('ora');
const authService = require('../services/auth');
const api = require('../services/api');
const { displayEarnings, displayError } = require('../ui/display');

async function earningsCommand() {
  // Check authentication
  try {
    authService.requireAuth();
  } catch (error) {
    displayError(error.message);
    return;
  }

  const spinner = ora('Fetching earnings...').start();

  try {
    // Fetch earnings from API
    const earnings = await api.earnings.get();

    spinner.stop();

    // Display earnings
    displayEarnings(earnings);
  } catch (error) {
    spinner.stop();
    displayError(error.response?.data?.message || error.message);
  }
}

module.exports = earningsCommand;
