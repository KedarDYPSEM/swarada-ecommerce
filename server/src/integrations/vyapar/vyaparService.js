const prisma = require('../../config/database');
const { AppError } = require('../../middleware/errorHandler');
const { findProductByVyaparIdentifier, normalizeSku } = require('./skuMapper');
const { enqueueSyncTask, processPendingTasks } = require('./syncQueue');

/**
 * Queue order sale deduction for Vyapar Gold Android
 */
const queueOrderSale = async (order) => {
  const items = order.items?.map((it) => ({
    sku: it.productSku || it.sku,
    productName: it.productName,
    quantitySold: it.quantity,
    unitPrice: it.unitPrice,
    total: it.total,
  })) || [];

  return enqueueSyncTask({
    action: 'DEDUCT_SALE_STOCK',
    referenceType: 'ORDER',
    referenceId: order.id,
    requestData: {
      orderNumber: order.orderNumber,
      customerName: order.shippingName,
      customerPhone: order.shippingPhone,
      city: order.shippingCity,
      totalAmount: order.totalAmount,
      items,
    },
  });
};

/**
 * Reconcile Inbound Stock from Vyapar Gold Android (Primary Inventory Authority)
 * When Vyapar performs physical stock take or shop sales in Kolhapur,
 * it syncs here to update website stock.
 */
const reconcileInboundStock = async (vyaparItems, source = 'VYAPAR_ANDROID_API') => {
  if (!Array.isArray(vyaparItems) || vyaparItems.length === 0) {
    throw new AppError('A valid array of Vyapar inventory items is required', 400);
  }

  const results = [];
  const logEntries = [];

  for (const item of vyaparItems) {
    const sku = normalizeSku(item.itemCode || item.sku || item.barcode);
    if (!sku) continue;

    const product = await findProductByVyaparIdentifier(sku);
    if (!product) {
      results.push({ sku, status: 'SKU_NOT_FOUND', message: 'Item not in web catalog' });
      continue;
    }

    const newStock = parseInt(item.currentStock ?? item.stock ?? item.quantity, 10);
    if (isNaN(newStock) || newStock < 0) {
      results.push({ sku, status: 'INVALID_STOCK_VALUE' });
      continue;
    }

    const diff = newStock - product.stockQuantity;

    if (diff !== 0) {
      // Update product stock and audit inventory movement
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: newStock },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            movementType: 'ADJUSTMENT',
            quantity: diff,
            balanceAfter: newStock,
            referenceType: 'VYAPAR_SYNC',
            notes: `Reconciled with Vyapar Gold Android balance (${diff > 0 ? '+' : ''}${diff} qty). Source: ${source}`,
          },
        });
      });

      results.push({
        sku,
        productName: product.name,
        oldStock: product.stockQuantity,
        newStock,
        adjustment: diff,
        status: 'UPDATED',
      });
    } else {
      results.push({
        sku,
        productName: product.name,
        stock: newStock,
        status: 'UNCHANGED',
      });
    }
  }

  // Record integration log
  await prisma.integrationLog.create({
    data: {
      service: 'VYAPAR',
      action: 'INBOUND_RECONCILIATION',
      status: 'SUCCESS',
      requestData: { totalItems: vyaparItems.length, source },
      responseData: { updatedCount: results.filter((r) => r.status === 'UPDATED').length, results },
    },
  });

  return {
    success: true,
    totalReceived: vyaparItems.length,
    updatedCount: results.filter((r) => r.status === 'UPDATED').length,
    unchangedCount: results.filter((r) => r.status === 'UNCHANGED').length,
    results,
  };
};

/**
 * Get Vyapar integration audit logs
 */
const getSyncLogs = async (limit = 20) => {
  return prisma.integrationLog.findMany({
    where: { service: 'VYAPAR' },
    orderBy: { createdAt: 'desc' },
    take: Math.min(50, Math.max(1, parseInt(limit, 10) || 20)),
  });
};

/**
 * Get Integration Health Status
 */
const getIntegrationStatus = async () => {
  const [totalLogs, pendingTasks, lastSuccessfulSync] = await Promise.all([
    prisma.integrationLog.count({ where: { service: 'VYAPAR' } }),
    prisma.integrationLog.count({ where: { service: 'VYAPAR', status: 'PENDING' } }),
    prisma.integrationLog.findFirst({
      where: { service: 'VYAPAR', status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    service: 'Vyapar Gold Android',
    role: 'Primary Inventory Master',
    middlewareStatus: 'ACTIVE',
    totalSyncEvents: totalLogs,
    pendingQueueCount: pendingTasks,
    lastSuccessfulSyncAt: lastSuccessfulSync?.createdAt || null,
  };
};

/**
 * Trigger manual background queue processing
 */
const triggerManualSync = async () => {
  const results = await processPendingTasks();
  return {
    success: true,
    processedCount: results.length,
    results,
  };
};

module.exports = {
  queueOrderSale,
  reconcileInboundStock,
  getSyncLogs,
  getIntegrationStatus,
  triggerManualSync,
};
