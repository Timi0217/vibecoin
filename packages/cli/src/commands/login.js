/**
 * Login command
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const authService = require('../services/auth');
const { displayWelcome, displayError } = require('../ui/display');

async function loginCommand() {
  console.log(chalk.bold.cyan('\n💎 VibeCoin Login\n'));

  // Check if already authenticated
  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    console.log(chalk.yellow(`\nAlready logged in as @${user.username}`));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Continue with current account', value: 'continue' },
          { name: 'Logout and login with different account', value: 'logout' }
        ]
      }
    ]);

    if (action === 'continue') {
      return;
    }

    // Logout first
    await authService.logout();
    console.log(chalk.green('\n✅ Logged out successfully\n'));
  }

  // Prompt for credentials
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      validate: (input) => {
        if (!input || !input.includes('@')) {
          return 'Please enter a valid email address';
        }
        return true;
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      mask: '*',
      validate: (input) => {
        if (!input || input.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return true;
      }
    }
  ]);

  // Authenticate
  const spinner = ora('Authenticating...').start();

  try {
    const result = await authService.login(answers.email, answers.password);

    if (result.success) {
      spinner.succeed('Authentication successful!');
      displayWelcome(result.user.username);
    } else {
      spinner.fail('Authentication failed');
      displayError(result.error);
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Authentication failed');
    displayError(error.message);
    process.exit(1);
  }
}

module.exports = loginCommand;
