/**
 * Status command - Display user status and earnings
 */

const ora = require('ora');
const authService = require('../services/auth');
const api = require('../services/api');
const storage = require('../services/storage');
const { displayStatus, displayError } = require('../ui/display');

async function statusCommand() {
  // Check authentication
  try {
    authService.requireAuth();
  } catch (error) {
    displayError(error.message);
    return;
  }

  const spinner = ora('Fetching status...').start();

  try {
    // Fetch stats from API
    const stats = await api.earnings.getStats();

    // Save to local storage
    storage.saveEarnings(stats);

    spinner.stop();

    // Display status
    displayStatus(stats);
  } catch (error) {
    spinner.stop();

    // Try to show cached data
    const cached = storage.getEarnings();
    if (cached && cached.lastSync) {
      displayStatus({
        ...cached,
        daemon_running: false
      });
      console.log('⚠️  Showing cached data (API unavailable)\n');
    } else {
      displayError(error.response?.data?.message || error.message);
    }
  }
}

module.exports = statusCommand;
