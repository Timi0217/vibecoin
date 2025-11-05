/**
 * Terminal UI display helpers
 */

const chalk = require('chalk');
const boxen = require('boxen');
const Table = require('cli-table3');
const { VIBECOIN_TO_USD } = require('../utils/constants');

/**
 * Display welcome message
 * @param {string} username - Username
 */
function displayWelcome(username) {
  const message = `
Welcome to ${chalk.bold.cyan('VibeCoin')} 💎

Logged in as ${chalk.yellow(`@${username}`)}
Ready to earn VibeCoins!

${chalk.dim('Tip: Run "vibecoin wait 30" during your next build or AI response')}
`;

  console.log(
    boxen(message.trim(), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    })
  );
}

/**
 * Display task
 * @param {object} task - Task object
 */
function displayTask(task) {
  const reward = chalk.yellow(`${task.reward_coins} VibeCoins`);
  const time = chalk.dim(`~${task.estimated_seconds}s`);

  console.log(`\n${chalk.bold.cyan('💰 Task available!')} (${reward}, ${time})\n`);
  console.log(chalk.bold(`📸 ${task.type.replace('_', ' ').toUpperCase()}`));
  console.log(`${chalk.bold('Question:')} ${task.question}\n`);

  if (task.image_url) {
    console.log(chalk.dim(`Image: ${task.image_url}\n`));
  }

  // Display options
  if (task.options && task.options.length > 0) {
    task.options.forEach((option) => {
      console.log(`[${chalk.cyan(option.key)}] ${option.label}`);
    });
    console.log(`[${chalk.dim('s')}] Skip this task\n`);
  }
}

/**
 * Display task result
 * @param {object} result - Task result
 */
function displayTaskResult(result) {
  if (result.correct) {
    console.log(chalk.green(`\n✅ Correct! +${result.earned_coins} VibeCoins earned`));
  } else {
    console.log(chalk.red('\n❌ Incorrect. No coins earned.'));
  }

  const usd = (result.total_coins * VIBECOIN_TO_USD).toFixed(2);
  console.log(chalk.yellow(`💎 Session total: ${result.total_coins} VibeCoins ($${usd})\n`));
}

/**
 * Display status
 * @param {object} stats - User stats
 */
function displayStatus(stats) {
  const todayUsd = (stats.today_coins * VIBECOIN_TO_USD).toFixed(2);
  const weekUsd = (stats.week_coins * VIBECOIN_TO_USD).toFixed(2);
  const totalUsd = (stats.total_coins * VIBECOIN_TO_USD).toFixed(2);
  const accuracy = (stats.accuracy_rate * 100).toFixed(0);

  const content = `
💎 VibeCoin Status

${chalk.bold('Today:')} ${stats.today_coins} VibeCoins ${chalk.dim(`($${todayUsd})`)}
${chalk.bold('This week:')} ${stats.week_coins} VibeCoins ${chalk.dim(`($${weekUsd})`)}
${chalk.bold('All time:')} ${stats.total_coins} VibeCoins ${chalk.dim(`($${totalUsd})`)}

🔥 Streak: ${chalk.yellow(stats.streak_days)} days
⚡ Accuracy: ${chalk.cyan(`${accuracy}%`)}
🎯 Tasks completed: ${chalk.green(stats.tasks_completed)}

${stats.daemon_running ? chalk.green('✅ Daemon running') : chalk.dim('○ Daemon stopped')}
${chalk.bold('Next payout:')} $${totalUsd} ${chalk.dim('(minimum: $10)')}
`;

  console.log(
    boxen(content.trim(), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    })
  );
}

/**
 * Display earnings breakdown
 * @param {object} earnings - Earnings data
 */
function displayEarnings(earnings) {
  console.log(chalk.bold.cyan('\n💎 VibeCoin Earnings\n'));

  // Summary table
  const summaryTable = new Table({
    head: [chalk.cyan('Period'), chalk.cyan('VibeCoins'), chalk.cyan('USD')],
    style: { head: [], border: [] }
  });

  summaryTable.push(
    ['Today', earnings.today_coins, `$${(earnings.today_coins * VIBECOIN_TO_USD).toFixed(2)}`],
    ['This Week', earnings.week_coins, `$${(earnings.week_coins * VIBECOIN_TO_USD).toFixed(2)}`],
    ['This Month', earnings.month_coins, `$${(earnings.month_coins * VIBECOIN_TO_USD).toFixed(2)}`],
    ['All Time', chalk.bold(earnings.total_coins), chalk.bold(`$${(earnings.total_coins * VIBECOIN_TO_USD).toFixed(2)}`)]
  );

  console.log(summaryTable.toString());

  // Stats
  console.log(chalk.bold.cyan('\n📊 Statistics\n'));
  const statsTable = new Table({
    head: [chalk.cyan('Metric'), chalk.cyan('Value')],
    style: { head: [], border: [] }
  });

  statsTable.push(
    ['Tasks Completed', earnings.tasks_completed],
    ['Current Streak', `${earnings.streak_days} days`],
    ['Accuracy Rate', `${(earnings.accuracy_rate * 100).toFixed(1)}%`],
    ['Average per Task', `${(earnings.total_coins / Math.max(1, earnings.tasks_completed)).toFixed(1)} VC`]
  );

  console.log(statsTable.toString());
  console.log();
}

/**
 * Display payout confirmation
 * @param {object} payout - Payout data
 */
function displayPayoutConfirmation(payout) {
  const message = `
${chalk.green('✅ Payout requested:')} $${payout.amount_usd}

${chalk.bold('Method:')} ${payout.method}
${chalk.bold('Destination:')} ${payout.destination}
${chalk.bold('Expected delivery:')} 2-3 business days

You'll receive an email confirmation shortly.
`;

  console.log(
    boxen(message.trim(), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green'
    })
  );
}

/**
 * Display error
 * @param {string} message - Error message
 */
function displayError(message) {
  console.log(chalk.red(`\n❌ Error: ${message}\n`));
}

/**
 * Display success
 * @param {string} message - Success message
 */
function displaySuccess(message) {
  console.log(chalk.green(`\n✅ ${message}\n`));
}

/**
 * Display warning
 * @param {string} message - Warning message
 */
function displayWarning(message) {
  console.log(chalk.yellow(`\n⚠️  ${message}\n`));
}

/**
 * Display info
 * @param {string} message - Info message
 */
function displayInfo(message) {
  console.log(chalk.blue(`\nℹ️  ${message}\n`));
}

module.exports = {
  displayWelcome,
  displayTask,
  displayTaskResult,
  displayStatus,
  displayEarnings,
  displayPayoutConfirmation,
  displayError,
  displaySuccess,
  displayWarning,
  displayInfo
};
