/**
 * Payout controller
 */

const db = require('../utils/db');

/**
 * Request payout
 */
async function requestPayout(req, res, next) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const { amount_usd, amount_coins, method, destination } = req.body;

    // Validate input
    if (!amount_usd || !amount_coins || !method || !destination) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const minimumPayout = parseFloat(process.env.MINIMUM_PAYOUT_USD || 10);

    if (amount_usd < minimumPayout) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Minimum payout is $${minimumPayout}`
      });
    }

    // Get user's current balance
    const userResult = await client.query(
      'SELECT total_coins_earned FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Check if user has enough coins
    if (user.total_coins_earned < amount_coins) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Create payout request
    const payoutResult = await client.query(
      `INSERT INTO payouts (user_id, amount_usd, amount_coins, method, destination, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [userId, amount_usd, amount_coins, method, destination]
    );

    const payout = payoutResult.rows[0];

    // Deduct coins from user (or mark as pending)
    // For MVP, we'll keep the coins until payout is confirmed
    // In production, you might want to create a "pending_payout" field

    await client.query('COMMIT');

    res.json({
      success: true,
      payout: {
        id: payout.id,
        amount_usd: parseFloat(payout.amount_usd),
        amount_coins: payout.amount_coins,
        method: payout.method,
        destination: payout.destination,
        status: payout.status,
        requested_at: payout.requested_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

/**
 * Get payout history
 */
async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT
         id,
         amount_usd,
         amount_coins,
         method,
         destination,
         status,
         requested_at,
         paid_at
       FROM payouts
       WHERE user_id = $1
       ORDER BY requested_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      payouts: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update payout status (admin only - simplified for MVP)
 */
async function updateStatus(req, res, next) {
  try {
    const payoutId = req.params.id;
    const { status, notes } = req.body;

    const result = await db.query(
      `UPDATE payouts
       SET status = $1,
           notes = $2,
           paid_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE paid_at END
       WHERE id = $3
       RETURNING *`,
      [status, notes, payoutId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    res.json({
      success: true,
      payout: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requestPayout,
  getHistory,
  updateStatus
};
