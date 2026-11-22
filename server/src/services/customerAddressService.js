const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get customer addresses
 */
const getAddresses = async (userId) => {
  return prisma.customerAddress.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });
};

/**
 * Add new address
 */
const addAddress = async (userId, data) => {
  const { label, fullName, phone, addressLine1, addressLine2, landmark, city, state, pincode, isDefault } = data;

  if (isDefault) {
    await prisma.customerAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const count = await prisma.customerAddress.count({ where: { userId } });

  return prisma.customerAddress.create({
    data: {
      userId,
      label: label || 'Home',
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || null,
      landmark: landmark || null,
      city,
      state,
      pincode,
      isDefault: isDefault || count === 0,
    },
  });
};

/**
 * Delete address
 */
const deleteAddress = async (userId, addressId) => {
  await prisma.customerAddress.deleteMany({
    where: { id: parseInt(addressId, 10), userId },
  });

  return getAddresses(userId);
};

module.exports = {
  getAddresses,
  addAddress,
  deleteAddress,
};
