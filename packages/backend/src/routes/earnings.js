/**
 * Earnings routes
 */

const express = require('express');
const router = express.Router();
const earningsController = require('../controllers/earningsController');
const { authenticate } = require('../middleware/auth');

// All earnings routes require authentication
router.use(authenticate);

router.get('/', earningsController.getEarnings);
router.get('/stats', earningsController.getStats);

module.exports = router;
