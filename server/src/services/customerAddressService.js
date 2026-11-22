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
 * Update existing address
 */
const updateAddress = async (userId, addressId, data) => {
  const id = parseInt(addressId, 10);
  const { label, fullName, phone, addressLine1, addressLine2, landmark, city, state, pincode, isDefault } = data;

  const existing = await prisma.customerAddress.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError('Address not found.', 404);
  }

  if (isDefault) {
    await prisma.customerAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  await prisma.customerAddress.update({
    where: { id },
    data: {
      label: label !== undefined ? label : existing.label,
      fullName: fullName !== undefined ? fullName : existing.fullName,
      phone: phone !== undefined ? phone : existing.phone,
      addressLine1: addressLine1 !== undefined ? addressLine1 : existing.addressLine1,
      addressLine2: addressLine2 !== undefined ? addressLine2 : existing.addressLine2,
      landmark: landmark !== undefined ? landmark : existing.landmark,
      city: city !== undefined ? city : existing.city,
      state: state !== undefined ? state : existing.state,
      pincode: pincode !== undefined ? pincode : existing.pincode,
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  return getAddresses(userId);
};

/**
 * Set address as default
 */
const setDefaultAddress = async (userId, addressId) => {
  const id = parseInt(addressId, 10);

  const existing = await prisma.customerAddress.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError('Address not found.', 404);
  }

  await prisma.customerAddress.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  await prisma.customerAddress.update({
    where: { id },
    data: { isDefault: true },
  });

  return getAddresses(userId);
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
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
