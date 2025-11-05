/**
 * Config command - Manage configuration
 */

const chalk = require('chalk');
const Table = require('cli-table3');
const config = require('../utils/config');
const { displaySuccess, displayError } = require('../ui/display');

/**
 * Show all configuration
 */
function showConfig() {
  const allConfig = config.getAll();

  // Hide sensitive data
  const safeConfig = { ...allConfig };
  if (safeConfig.authToken) {
    safeConfig.authToken = '***' + safeConfig.authToken.slice(-4);
  }

  console.log(chalk.bold.cyan('\n⚙️  VibeCoin Configuration\n'));

  const table = new Table({
    head: [chalk.cyan('Key'), chalk.cyan('Value')],
    style: { head: [], border: [] }
  });

  Object.entries(safeConfig).forEach(([key, value]) => {
    table.push([key, JSON.stringify(value, null, 2)]);
  });

  console.log(table.toString());
  console.log();
}

/**
 * Get configuration value
 * @param {string} key - Config key
 */
function getConfig(key) {
  const value = config.get(key);

  if (value === undefined) {
    displayError(`Configuration key "${key}" not found`);
    return;
  }

  console.log(chalk.cyan(`\n${key}:`), value, '\n');
}

/**
 * Set configuration value
 * @param {string} key - Config key
 * @param {string} value - Config value
 */
function setConfig(key, value) {
  // Prevent setting sensitive keys directly
  const protectedKeys = ['authToken', 'user'];
  if (protectedKeys.includes(key)) {
    displayError(`Cannot set "${key}" directly. Use "vibecoin login" instead.`);
    return;
  }

  // Parse value
  let parsedValue = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (!isNaN(value)) parsedValue = Number(value);

  config.set(key, parsedValue);
  displaySuccess(`Configuration updated: ${key} = ${parsedValue}`);
}

/**
 * Config command handler
 * @param {string} action - Action (show, get, set)
 * @param {string} key - Config key
 * @param {string} value - Config value (for set)
 */
async function configCommand(action, key, value) {
  if (!action) {
    // Show all config if no action provided
    showConfig();
    return;
  }

  switch (action.toLowerCase()) {
    case 'show':
    case 'list':
      showConfig();
      break;

    case 'get':
      if (!key) {
        displayError('Please provide a key: vibecoin config get <key>');
        return;
      }
      getConfig(key);
      break;

    case 'set':
      if (!key || value === undefined) {
        displayError('Please provide key and value: vibecoin config set <key> <value>');
        return;
      }
      setConfig(key, value);
      break;

    default:
      displayError(`Unknown action "${action}". Use: show, get, or set`);
  }
}

module.exports = configCommand;
