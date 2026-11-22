const express = require('express');
const vyaparController = require('../controllers/vyaparController');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// Public / webhook receiver for Vyapar Gold Android synchronization
router.post('/reconcile', vyaparController.reconcileStock);

// Protected admin endpoints for monitoring and triggering sync
router.get('/status', requireAdmin, vyaparController.getStatus);
router.get('/logs', requireAdmin, vyaparController.getLogs);
router.post('/sync-now', requireAdmin, vyaparController.syncNow);

module.exports = router;
