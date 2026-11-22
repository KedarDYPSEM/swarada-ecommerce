const prisma = require('../config/database');

/**
 * Aggregates live executive dashboard metrics from MySQL
 */
const getDashboardStats = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalOrdersCount,
    pendingOrdersCount,
    deliveredOrdersCount,
    cancelledOrdersCount,
    totalCustomersCount,
    totalProductsCount,
    outOfStockCount,
    revenueAgg,
    todayRevenueAgg,
    monthlyRevenueAgg,
    lowStockProducts,
    recentOrders,
    bestSellingProducts,
    recentOrdersForChart,
  ] = await Promise.all([
    // Total Orders
    prisma.order.count(),
    // Pending Orders
    prisma.order.count({
      where: { status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING'] } },
    }),
    // Delivered Orders
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    // Cancelled Orders
    prisma.order.count({ where: { status: { in: ['CANCELLED', 'REFUNDED'] } } }),
    // Total Customers
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    // Total Products
    prisma.product.count({ where: { isActive: true } }),
    // Out of Stock
    prisma.product.count({ where: { isActive: true, stockQuantity: 0 } }),
    // Total Revenue (all non-cancelled orders)
    prisma.order.aggregate({
      where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      _sum: { totalAmount: true },
    }),
    // Today's Revenue
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfToday },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      _sum: { totalAmount: true },
    }),
    // Monthly Revenue
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      _sum: { totalAmount: true },
    }),
    // Low Stock Products (stock <= lowStockThreshold and > 0)
    prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { gt: 0, lte: 4 },
      },
      take: 6,
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        sellingPrice: true,
      },
    }),
    // Recent Orders (last 8)
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        items: {
          take: 2,
          select: {
            productName: true,
            productSku: true,
            quantity: true,
          },
        },
      },
    }),
    // Best Selling Products
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        sellingPrice: true,
        stockQuantity: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    }),
    // Last 7 days orders for sales trend chart
    prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    }),
  ]);

  // Aggregate daily sales for the past 7 days chart
  const salesByDay = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayKey = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    salesByDay[dayKey] = 0;
  }

  recentOrdersForChart.forEach((ord) => {
    const dayKey = new Date(ord.createdAt).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    if (salesByDay[dayKey] !== undefined) {
      salesByDay[dayKey] += parseFloat(ord.totalAmount) || 0;
    }
  });

  const chartData = Object.keys(salesByDay).map((date) => ({
    date,
    sales: Math.round(salesByDay[date]),
  }));

  return {
    metrics: {
      totalRevenue: parseFloat(revenueAgg._sum.totalAmount) || 0,
      todayRevenue: parseFloat(todayRevenueAgg._sum.totalAmount) || 0,
      monthlyRevenue: parseFloat(monthlyRevenueAgg._sum.totalAmount) || 0,
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      deliveredOrders: deliveredOrdersCount,
      cancelledOrders: cancelledOrdersCount,
      totalCustomers: totalCustomersCount,
      totalProducts: totalProductsCount,
      lowStockProductsCount: lowStockProducts.length,
      outOfStockCount,
    },
    lowStockProducts,
    recentOrders,
    bestSellingProducts,
    chartData,
  };
};

module.exports = {
  getDashboardStats,
};
