/**
 * Web routes for task viewing pages
 */

const express = require('express');
const router = express.Router();
const webController = require('../controllers/webController');

// Public task view page (no auth required - for display only)
router.get('/t/:taskId', webController.viewTask);

module.exports = router;
