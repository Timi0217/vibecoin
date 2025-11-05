/**
 * Payout command - Request payout
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const authService = require('../services/auth');
const api = require('../services/api');
const { MINIMUM_PAYOUT_USD, VIBECOIN_TO_USD, PAYOUT_METHODS } = require('../utils/constants');
const { displayPayoutConfirmation, displayError, displayWarning } = require('../ui/display');

async function payoutCommand() {
  // Check authentication
  try {
    authService.requireAuth();
  } catch (error) {
    displayError(error.message);
    return;
  }

  console.log(chalk.bold.cyan('\n💰 Payout Request\n'));

  // Get current earnings
  const spinner = ora('Fetching earnings...').start();

  let earnings;
  try {
    earnings = await api.earnings.get();
    spinner.stop();
  } catch (error) {
    spinner.fail('Failed to fetch earnings');
    displayError(error.response?.data?.message || error.message);
    return;
  }

  const availableUsd = earnings.total_coins * VIBECOIN_TO_USD;

  console.log(chalk.bold('Available:'), chalk.green(`$${availableUsd.toFixed(2)}`), chalk.dim(`(${earnings.total_coins} VibeCoins)`));
  console.log(chalk.bold('Minimum:'), chalk.yellow(`$${MINIMUM_PAYOUT_USD}\n`));

  // Check if meets minimum
  if (availableUsd < MINIMUM_PAYOUT_USD) {
    displayWarning(`You need at least $${MINIMUM_PAYOUT_USD} to request a payout.`);
    const needed = MINIMUM_PAYOUT_USD - availableUsd;
    console.log(chalk.dim(`Keep earning! You need $${needed.toFixed(2)} more.\n`));
    return;
  }

  // Choose payout method
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Choose payout method:',
      choices: [
        { name: 'Venmo (US only)', value: PAYOUT_METHODS.VENMO },
        { name: 'Zelle (US only)', value: PAYOUT_METHODS.ZELLE },
        { name: 'PayPal (International)', value: PAYOUT_METHODS.PAYPAL },
        { name: 'Bitcoin (International, no fees)', value: PAYOUT_METHODS.BITCOIN }
      ]
    }
  ]);

  // Get destination
  let destinationPrompt = 'Enter your ';
  switch (method) {
    case PAYOUT_METHODS.VENMO:
      destinationPrompt += 'Venmo username:';
      break;
    case PAYOUT_METHODS.ZELLE:
      destinationPrompt += 'Zelle email or phone:';
      break;
    case PAYOUT_METHODS.PAYPAL:
      destinationPrompt += 'PayPal email:';
      break;
    case PAYOUT_METHODS.BITCOIN:
      destinationPrompt += 'Bitcoin address:';
      break;
  }

  const { destination } = await inquirer.prompt([
    {
      type: 'input',
      name: 'destination',
      message: destinationPrompt,
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Please enter a valid destination';
        }
        return true;
      }
    }
  ]);

  // Confirm payout
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Request payout of $${availableUsd.toFixed(2)} to ${destination}?`,
      default: true
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('\n⚠️  Payout cancelled\n'));
    return;
  }

  // Submit payout request
  const payoutSpinner = ora('Submitting payout request...').start();

  try {
    const payout = await api.payouts.request({
      amount_usd: availableUsd,
      amount_coins: earnings.total_coins,
      method,
      destination
    });

    payoutSpinner.succeed('Payout request submitted!');

    displayPayoutConfirmation(payout);
  } catch (error) {
    payoutSpinner.fail('Payout request failed');
    displayError(error.response?.data?.message || error.message);
  }
}

module.exports = payoutCommand;
