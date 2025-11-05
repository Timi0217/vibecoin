/**
 * Task controller
 */

const db = require('../utils/db');

/**
 * Get next available task for user
 */
async function getNext(req, res, next) {
  try {
    const userId = req.user.id;

    // Find a task the user hasn't completed yet
    const result = await db.query(
      `SELECT t.id, t.type, t.question, t.image_url, t.reward_coins, t.estimated_seconds, t.metadata
       FROM tasks t
       WHERE t.active = true
         AND NOT EXISTS (
           SELECT 1 FROM task_completions tc
           WHERE tc.task_id = t.id AND tc.user_id = $1
         )
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No tasks available'
      });
    }

    const task = result.rows[0];

    // Parse metadata and add options if available
    if (task.metadata && task.metadata.options) {
      task.options = task.metadata.options;
    } else {
      // Default options for yes/no questions
      task.options = [
        { key: 'y', label: 'Yes' },
        { key: 'n', label: 'No' }
      ];
    }

    // Remove metadata from response
    delete task.metadata;

    res.json(task);
  } catch (error) {
    next(error);
  }
}

/**
 * Submit task answer
 */
async function submit(req, res, next) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const taskId = req.params.id;
    const { answer, time_taken_seconds } = req.body;

    // Get task
    const taskResult = await client.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskResult.rows[0];

    // Check if already completed
    const existingResult = await client.query(
      'SELECT id FROM task_completions WHERE user_id = $1 AND task_id = $2',
      [userId, taskId]
    );

    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Task already completed'
      });
    }

    // Check answer
    const correct = answer.toLowerCase() === task.correct_answer.toLowerCase();
    const coinsEarned = correct ? task.reward_coins : 0;

    // Record completion
    await client.query(
      `INSERT INTO task_completions (user_id, task_id, answer_given, correct, coins_earned, time_taken_seconds)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, taskId, answer, correct, coinsEarned, time_taken_seconds]
    );

    // Update user stats
    const statsUpdate = await client.query(
      `UPDATE users
       SET total_coins_earned = total_coins_earned + $1,
           total_tasks_completed = total_tasks_completed + 1,
           last_active_date = CURRENT_DATE
       WHERE id = $2
       RETURNING total_coins_earned, total_tasks_completed`,
      [coinsEarned, userId]
    );

    // Recalculate accuracy
    const accuracyResult = await client.query(
      `SELECT
         COUNT(*) FILTER (WHERE correct = true)::DECIMAL / NULLIF(COUNT(*), 0) as accuracy
       FROM task_completions
       WHERE user_id = $1`,
      [userId]
    );

    const accuracy = accuracyResult.rows[0].accuracy || 0;

    await client.query(
      'UPDATE users SET accuracy_rate = $1 WHERE id = $2',
      [accuracy * 100, userId]
    );

    await client.query('COMMIT');

    const userStats = statsUpdate.rows[0];

    res.json({
      success: true,
      correct,
      earned_coins: coinsEarned,
      total_coins: userStats.total_coins_earned,
      total_usd: userStats.total_coins_earned * parseFloat(process.env.VIBECOIN_TO_USD || 0.25),
      accuracy_rate: parseFloat(accuracy),
      message: correct ? 'Correct! +' + coinsEarned + ' VibeCoins' : 'Incorrect'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

/**
 * Get task history
 */
async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      `SELECT
         tc.id,
         tc.completed_at,
         tc.correct,
         tc.coins_earned,
         tc.time_taken_seconds,
         t.type,
         t.question
       FROM task_completions tc
       JOIN tasks t ON tc.task_id = t.id
       WHERE tc.user_id = $1
       ORDER BY tc.completed_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      history: result.rows,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNext,
  submit,
  getHistory
};
