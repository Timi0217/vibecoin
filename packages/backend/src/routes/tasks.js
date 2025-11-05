/**
 * Tasks routes
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticate);

router.get('/next', taskController.getNext);
router.post('/:id/submit', taskController.submit);
router.get('/history', taskController.getHistory);

module.exports = router;
