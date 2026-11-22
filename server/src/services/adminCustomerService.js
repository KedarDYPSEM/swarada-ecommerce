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
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const enriched = customers.map((c) => {
    const validOrders = c.orders.filter((o) => o.status !== 'CANCELLED');
    const totalSpent = validOrders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0);
    const displayName = c.profile
      ? (`${c.profile.firstName || ''} ${c.profile.lastName || ''}`.trim() || c.profile.displayName || 'Customer')
      : 'Customer';

    const defaultAddress = c.addresses?.[0] || null;

    return {
      id: c.id,
      email:
        c.email && !c.email.includes('@customer.swarada.com')
          ? c.email
          : c.phone
          ? `${c.phone} (Phone Account)`
          : c.email,
      rawEmail: c.email,
      phone: c.phone || '—',
      name: displayName,
      profile: c.profile || { firstName: displayName, lastName: '', displayName },
      addresses: c.addresses || [],
      city: defaultAddress?.city || '—',
      state: defaultAddress?.state || '—',
      isActive: c.isActive,
      joinedAt: c.createdAt,
      createdAt: c.createdAt,
      orders: c.orders || [],
      totalOrders: c.orders.length,
      totalOrdersCount: c.orders.length,
      totalSpent: Math.round(totalSpent),
      lifetimeSpend: Math.round(totalSpent),
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

  const validOrders = (customer.orders || []).filter((o) => o.status !== 'CANCELLED');
  const totalSpent = validOrders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0);
  const displayName = customer.profile
    ? (`${customer.profile.firstName || ''} ${customer.profile.lastName || ''}`.trim() || customer.profile.displayName || 'Customer')
    : 'Customer';

  return {
    ...customer,
    name: displayName,
    totalOrdersCount: customer.orders?.length || 0,
    totalOrders: customer.orders?.length || 0,
    lifetimeSpend: Math.round(totalSpent),
    totalSpent: Math.round(totalSpent),
  };
};

/**
 * Update Customer Info
 */
const updateCustomer = async (id, data) => {
  const userId = parseInt(id, 10);
  const { firstName, lastName, phone, email, isActive } = data;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      phone: phone !== undefined ? phone : undefined,
      email: email !== undefined ? email : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      profile: {
        update: {
          firstName: firstName !== undefined ? firstName : undefined,
          lastName: lastName !== undefined ? lastName : undefined,
          displayName: firstName ? `${firstName} ${lastName || ''}`.trim() : undefined,
        },
      },
    },
    include: {
      profile: true,
      addresses: true,
      orders: true,
    },
  });

  return updated;
};

/**
 * Toggle Customer Active / Inactive
 */
const toggleCustomerStatus = async (id) => {
  const userId = parseInt(id, 10);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Customer not found', 404);

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    include: { profile: true },
  });
};

module.exports = {
  listCustomers,
  getCustomerDetails,
  getCustomerById: getCustomerDetails,
  updateCustomer,
  toggleCustomerStatus,
};
