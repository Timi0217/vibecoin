/**
 * Wait command - Show tasks during wait time
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const authService = require('../services/auth');
const api = require('../services/api');
const { displayTask, displayTaskResult, displayError, displayWarning } = require('../ui/display');

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process a single task
 * @returns {Promise<boolean>} True if task was completed
 */
async function processTask() {
  try {
    // Get next task
    const spinner = ora('Fetching task...').start();
    const task = await api.tasks.getNext();
    spinner.stop();

    if (!task || !task.id) {
      console.log(chalk.yellow('\n⚠️  No tasks available right now\n'));
      return false;
    }

    // Display task
    displayTask(task);

    // Get user answer
    const { answer } = await inquirer.prompt([
      {
        type: 'input',
        name: 'answer',
        message: 'Your answer:',
        validate: (input) => {
          if (!input) {
            return 'Please enter an answer or "s" to skip';
          }
          return true;
        }
      }
    ]);

    // Check if user wants to skip
    if (answer.toLowerCase() === 's') {
      console.log(chalk.dim('\nTask skipped\n'));
      return false;
    }

    // Submit answer
    const submitSpinner = ora('Submitting answer...').start();
    const startTime = Date.now();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const result = await api.tasks.submit(task.id, {
      answer: answer.toLowerCase(),
      time_taken_seconds: timeTaken
    });

    submitSpinner.stop();

    // Display result
    displayTaskResult(result);

    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(chalk.yellow('\n⚠️  No tasks available right now\n'));
    } else {
      displayError(error.response?.data?.message || error.message);
    }
    return false;
  }
}

/**
 * Wait command handler
 * @param {string} seconds - Seconds to wait
 * @param {object} options - Command options
 */
async function waitCommand(seconds, options) {
  // Check authentication
  try {
    authService.requireAuth();
  } catch (error) {
    displayError(error.message);
    return;
  }

  const waitTime = parseInt(seconds, 10);

  if (isNaN(waitTime) || waitTime < 1) {
    displayError('Please provide a valid number of seconds (e.g., vibecoin wait 30)');
    return;
  }

  console.log(chalk.cyan(`\n⏳ Waiting ${waitTime} seconds...\n`));

  // If skip-tasks option, just wait
  if (options.skipTasks) {
    await sleep(waitTime * 1000);
    console.log(chalk.green('✅ Wait complete!\n'));
    return;
  }

  // Calculate intervals for showing tasks
  const taskInterval = 15; // Show task every 15 seconds
  let remainingTime = waitTime;
  let tasksCompleted = 0;

  while (remainingTime > 0) {
    // Show task if enough time remaining
    if (remainingTime >= taskInterval) {
      const completed = await processTask();
      if (completed) {
        tasksCompleted++;
      }

      // Wait for task interval or remaining time
      const waitFor = Math.min(taskInterval, remainingTime);
      if (waitFor > 0) {
        console.log(chalk.dim(`⏳ ${remainingTime - waitFor} seconds remaining...\n`));
        await sleep(waitFor * 1000);
        remainingTime -= waitFor;
      }
    } else {
      // Not enough time for another task, just wait
      await sleep(remainingTime * 1000);
      remainingTime = 0;
    }
  }

  console.log(chalk.green(`\n✅ Wait complete!`));
  if (tasksCompleted > 0) {
    console.log(chalk.yellow(`💎 You completed ${tasksCompleted} task(s) during this wait\n`));
  } else {
    console.log();
  }
}

module.exports = waitCommand;
