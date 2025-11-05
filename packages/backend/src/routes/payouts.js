/**
 * Payouts routes
 */

const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const { authenticate } = require('../middleware/auth');

// All payout routes require authentication
router.use(authenticate);

router.post('/request', payoutController.requestPayout);
router.get('/history', payoutController.getHistory);

// Admin route (simplified for MVP - should have admin auth in production)
router.patch('/:id/status', payoutController.updateStatus);

module.exports = router;
