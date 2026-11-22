const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * List registered customers with lifetime purchase metrics
 */
const listCustomers = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const where = {
    role: 'CUSTOMER',
  };

  if (query.search) {
    const term = query.search.trim();
    where.OR = [
      { email: { contains: term } },
      { phone: { contains: term } },
      {
        profile: {
          OR: [
            { firstName: { contains: term } },
            { lastName: { contains: term } },
          ],
        },
      },
    ];
  }

  const [customers, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        profile: true,
        addresses: {
          take: 1,
          where: { isDefault: true },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const enriched = customers.map((c) => {
    const validOrders = c.orders.filter((o) => o.status !== 'CANCELLED');
    const totalSpent = validOrders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0);

    return {
      id: c.id,
      email: c.email,
      phone: c.phone,
      name: c.profile ? `${c.profile.firstName} ${c.profile.lastName}` : c.email,
      city: c.addresses[0]?.city || 'N/A',
      state: c.addresses[0]?.state || 'N/A',
      isActive: c.isActive,
      joinedAt: c.createdAt,
      totalOrders: c.orders.length,
      totalSpent: Math.round(totalSpent),
    };
  });

  return {
    customers: enriched,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Get detailed customer profile with order history
 */
const getCustomerDetails = async (id) => {
  const customer = await prisma.user.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      profile: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      },
    },
  });

  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  return customer;
};

module.exports = {
  listCustomers,
  getCustomerDetails,
};
