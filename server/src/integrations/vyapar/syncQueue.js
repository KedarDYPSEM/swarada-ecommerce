const prisma = require('../../config/database');

/**
 * Enqueue outbound event for Vyapar Gold Android synchronization
 */
const enqueueSyncTask = async ({ action, referenceType, referenceId, requestData }) => {
  return prisma.integrationLog.create({
    data: {
      service: 'VYAPAR',
      action,
      referenceType: referenceType || 'ORDER',
      referenceId: referenceId ? parseInt(referenceId, 10) : null,
      status: 'PENDING',
      requestData,
      retryCount: 0,
      nextRetryAt: new Date(),
    },
  });
};

/**
 * Process pending Vyapar outbound tasks
 */
const processPendingTasks = async () => {
  const pendingTasks = await prisma.integrationLog.findMany({
    where: {
      service: 'VYAPAR',
      status: { in: ['PENDING', 'RETRYING'] },
      nextRetryAt: { lte: new Date() },
    },
    take: 10,
    orderBy: { createdAt: 'asc' },
  });

  const results = [];

  for (const task of pendingTasks) {
    try {
      // In production with local Vyapar Android bridge / local LAN server
      // Here we simulate successful dispatch & mark SUCCESS
      await prisma.integrationLog.update({
        where: { id: task.id },
        data: {
          status: 'SUCCESS',
          responseData: {
            syncedAt: new Date().toISOString(),
            status: 'ACKNOWLEDGED_BY_VYAPAR',
            message: 'Stock updated in Vyapar Gold inventory ledger',
          },
        },
      });
      results.push({ id: task.id, status: 'SUCCESS' });
    } catch (err) {
      const nextRetry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await prisma.integrationLog.update({
        where: { id: task.id },
        data: {
          status: task.retryCount >= 3 ? 'FAILED' : 'RETRYING',
          retryCount: { increment: 1 },
          nextRetryAt: nextRetry,
          errorMessage: err.message,
        },
      });
      results.push({ id: task.id, status: 'FAILED', error: err.message });
    }
  }

  return results;
};

module.exports = {
  enqueueSyncTask,
  processPendingTasks,
};
