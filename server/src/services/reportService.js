const prisma = require('../config/database');

/**
 * Generate Comprehensive Executive Sales & Tax Reports
 */
const getSalesReport = async (query = {}) => {
  const where = {
    status: { notIn: ['CANCELLED', 'REFUNDED'] },
  };

  if (query.startDate) {
    where.createdAt = {
      ...where.createdAt,
      gte: new Date(query.startDate),
    };
  }

  if (query.endDate) {
    where.createdAt = {
      ...where.createdAt,
      lte: new Date(query.endDate),
    };
  }

  // 1. Core Financial Aggregations
  const [ordersCount, totalsAgg, paymentMethodCounts] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where,
      _sum: {
        totalAmount: true,
        subtotal: true,
        discountAmount: true,
        gstAmount: true,
        shippingAmount: true,
      },
    }),
    prisma.order.groupBy({
      by: ['paymentMethod'],
      where,
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
  ]);

  const grossSales = parseFloat(totalsAgg._sum.subtotal || 0);
  const totalDiscounts = parseFloat(totalsAgg._sum.discountAmount || 0);
  const totalTax = parseFloat(totalsAgg._sum.gstAmount || 0);
  const totalShipping = parseFloat(totalsAgg._sum.shippingAmount || 0);
  const netRevenue = parseFloat(totalsAgg._sum.totalAmount || 0);
  const averageOrderValue = ordersCount > 0 ? Math.round(netRevenue / ordersCount) : 0;

  // 2. Sales by Category
  const categories = await prisma.category.findMany({
    include: {
      productCategories: {
        include: {
          product: {
            include: {
              orderItems: {
                where: {
                  order: where,
                },
              },
            },
          },
        },
      },
    },
  });

  const categoryPerformance = categories
    .map((cat) => {
      let revenue = 0;
      let unitsSold = 0;
      cat.productCategories.forEach((pc) => {
        pc.product.orderItems.forEach((item) => {
          revenue += parseFloat(item.total || 0);
          unitsSold += item.quantity;
        });
      });

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        unitsSold,
        revenue,
      };
    })
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // 3. Top Best-Selling Sarees
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId', 'productName', 'productSku'],
    where: {
      order: where,
    },
    _sum: {
      quantity: true,
      total: true,
    },
    orderBy: {
      _sum: {
        total: 'desc',
      },
    },
    take: 8,
  });

  return {
    kpis: {
      ordersCount,
      grossSales,
      totalDiscounts,
      totalTax,
      totalShipping,
      netRevenue,
      averageOrderValue,
    },
    paymentMethodBreakdown: paymentMethodCounts.map((pm) => ({
      method: pm.paymentMethod,
      orderCount: pm._count.id,
      revenue: parseFloat(pm._sum.totalAmount || 0),
    })),
    categoryPerformance,
    topProducts: topProducts.map((p) => ({
      id: p.productId,
      name: p.productName,
      sku: p.productSku,
      unitsSold: p._sum.quantity,
      totalRevenue: parseFloat(p._sum.total || 0),
    })),
  };
};

module.exports = {
  getSalesReport,
};
