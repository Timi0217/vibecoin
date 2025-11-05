/**
 * Logout command
 */

const chalk = require('chalk');
const ora = require('ora');
const authService = require('../services/auth');
const { displaySuccess, displayError } = require('../ui/display');

async function logoutCommand() {
  // Check if authenticated
  if (!authService.isAuthenticated()) {
    console.log(chalk.yellow('\n⚠️  Not currently logged in\n'));
    return;
  }

  const user = authService.getCurrentUser();
  const spinner = ora(`Logging out @${user.username}...`).start();

  try {
    await authService.logout();
    spinner.succeed('Logged out successfully');
    displaySuccess('You have been logged out from VibeCoin');
  } catch (error) {
    spinner.fail('Logout failed');
    displayError(error.message);
  }
}

module.exports = logoutCommand;
