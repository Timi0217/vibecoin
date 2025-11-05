/**
 * Start daemon command
 * Note: For MVP, daemon functionality is simplified
 */

const chalk = require('chalk');
const { displaySuccess, displayWarning } = require('../ui/display');

async function startCommand() {
  displayWarning('Daemon mode is not yet implemented in MVP');
  console.log(chalk.dim('For now, use "vibecoin wait <seconds>" to manually trigger tasks\n'));
  console.log(chalk.cyan('Coming soon in Phase 2: Automatic idle detection!\n'));
}

module.exports = startCommand;
