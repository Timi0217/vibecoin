/**
 * Earnings controller
 */

const db = require('../utils/db');

/**
 * Get total earnings
 */
async function getEarnings(req, res, next) {
  try {
    const userId = req.user.id;

    // Get earnings by period
    const result = await db.query(
      `SELECT
         COALESCE(SUM(coins_earned) FILTER (WHERE completed_at >= CURRENT_DATE), 0) as today_coins,
         COALESCE(SUM(coins_earned) FILTER (WHERE completed_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as week_coins,
         COALESCE(SUM(coins_earned) FILTER (WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as month_coins,
         COALESCE(SUM(coins_earned), 0) as total_coins,
         COUNT(*) as tasks_completed,
         COUNT(*) FILTER (WHERE correct = true)::DECIMAL / NULLIF(COUNT(*), 0) as accuracy_rate
       FROM task_completions
       WHERE user_id = $1`,
      [userId]
    );

    const earnings = result.rows[0];

    res.json({
      today_coins: parseInt(earnings.today_coins),
      week_coins: parseInt(earnings.week_coins),
      month_coins: parseInt(earnings.month_coins),
      total_coins: parseInt(earnings.total_coins),
      tasks_completed: parseInt(earnings.tasks_completed),
      accuracy_rate: parseFloat(earnings.accuracy_rate) || 0,
      streak_days: 0 // TODO: Calculate streak
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get detailed stats
 */
async function getStats(req, res, next) {
  try {
    const userId = req.user.id;

    // Get user stats
    const userResult = await db.query(
      `SELECT
         total_coins_earned,
         total_tasks_completed,
         accuracy_rate,
         current_streak_days
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Get period-specific earnings
    const earningsResult = await db.query(
      `SELECT
         COALESCE(SUM(coins_earned) FILTER (WHERE completed_at >= CURRENT_DATE), 0) as today_coins,
         COALESCE(SUM(coins_earned) FILTER (WHERE completed_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as week_coins
       FROM task_completions
       WHERE user_id = $1`,
      [userId]
    );

    const earnings = earningsResult.rows[0];

    res.json({
      today_coins: parseInt(earnings.today_coins),
      week_coins: parseInt(earnings.week_coins),
      total_coins: user.total_coins_earned,
      tasks_completed: user.total_tasks_completed,
      accuracy_rate: parseFloat(user.accuracy_rate) / 100,
      streak_days: user.current_streak_days,
      daemon_running: false // MVP doesn't have daemon
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEarnings,
  getStats
};
