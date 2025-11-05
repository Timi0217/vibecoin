/**
 * Stop daemon command
 * Note: For MVP, daemon functionality is simplified
 */

const chalk = require('chalk');
const { displayWarning } = require('../ui/display');

async function stopCommand() {
  displayWarning('Daemon mode is not yet implemented in MVP');
  console.log(chalk.dim('Use "vibecoin wait <seconds>" to manually trigger tasks\n'));
}

module.exports = stopCommand;
