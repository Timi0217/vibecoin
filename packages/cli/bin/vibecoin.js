#!/usr/bin/env node

/**
 * VibeCoin CLI
 * Entry point for the command-line interface
 */

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

// Import commands
const loginCommand = require('../src/commands/login');
const logoutCommand = require('../src/commands/logout');
const waitCommand = require('../src/commands/wait');
const statusCommand = require('../src/commands/status');
const earningsCommand = require('../src/commands/earnings');
const payoutCommand = require('../src/commands/payout');
const startCommand = require('../src/commands/start');
const stopCommand = require('../src/commands/stop');
const configCommand = require('../src/commands/config');

// Configure program
program
  .name('vibecoin')
  .description('💎 VibeCoin - Earn money while you code')
  .version(packageJson.version);

// Login command
program
  .command('login')
  .description('Authenticate with VibeCoin')
  .action(loginCommand);

// Logout command
program
  .command('logout')
  .description('Log out from VibeCoin')
  .action(logoutCommand);

// Wait command (primary earning mechanism for MVP)
program
  .command('wait <seconds>')
  .description('Wait and show available tasks to earn VibeCoins')
  .option('-s, --skip-tasks', 'Skip tasks and just wait')
  .action(waitCommand);

// Status command
program
  .command('status')
  .description('Show current status and earnings')
  .action(statusCommand);

// Earnings command
program
  .command('earnings')
  .description('Show detailed earnings breakdown')
  .action(earningsCommand);

// Payout command
program
  .command('payout')
  .description('Request payout (minimum $10)')
  .action(payoutCommand);

// Start daemon command
program
  .command('start')
  .description('Start VibeCoin daemon (background process)')
  .action(startCommand);

// Stop daemon command
program
  .command('stop')
  .description('Stop VibeCoin daemon')
  .action(stopCommand);

// Config command
program
  .command('config [action] [key] [value]')
  .description('Manage configuration (show, set, get)')
  .action(configCommand);

// Error handling
program.on('command:*', (operands) => {
  console.error(chalk.red(`\n❌ Unknown command: ${operands[0]}\n`));
  console.log(chalk.yellow('Run "vibecoin --help" to see available commands\n'));
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
