const vyaparService = require('../integrations/vyapar/vyaparService');
const { catchAsync } = require('../middleware/errorHandler');

/**
 * Get Vyapar Gold connection status & metrics
 */
const getStatus = catchAsync(async (req, res) => {
  const status = await vyaparService.getIntegrationStatus();
  res.status(200).json({
    success: true,
    data: status,
  });
});

/**
 * Get Vyapar synchronization audit logs
 */
const getLogs = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const logs = await vyaparService.getSyncLogs(limit);
  res.status(200).json({
    success: true,
    data: logs,
  });
});

/**
 * Inbound inventory reconciliation from Vyapar Gold Android
 */
const reconcileStock = catchAsync(async (req, res) => {
  const { items, source } = req.body;
  const result = await vyaparService.reconcileInboundStock(items, source);
  res.status(200).json(result);
});

/**
 * Trigger manual sync processing
 */
const syncNow = catchAsync(async (req, res) => {
  const result = await vyaparService.triggerManualSync();
  res.status(200).json(result);
});

module.exports = {
  getStatus,
  getLogs,
  reconcileStock,
  syncNow,
};
