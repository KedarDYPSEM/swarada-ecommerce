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

  if (!fullName?.trim() || !phone?.trim() || !addressLine1?.trim() || !addressLine2?.trim() || !city?.trim() || !state?.trim() || !pincode?.trim()) {
    throw new AppError('Full address is compulsory for shipping labels. Please fill in Flat/Building, Street/Area, City, State, and Pincode.', 400);
  }

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
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      landmark: landmark ? landmark.trim() : null,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
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

  if (
    (fullName !== undefined && !fullName.trim()) ||
    (phone !== undefined && !phone.trim()) ||
    (addressLine1 !== undefined && !addressLine1.trim()) ||
    (addressLine2 !== undefined && !addressLine2.trim()) ||
    (city !== undefined && !city.trim()) ||
    (state !== undefined && !state.trim()) ||
    (pincode !== undefined && !pincode.trim())
  ) {
    throw new AppError('Full address is compulsory for shipping labels.', 400);
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
      fullName: fullName !== undefined ? fullName.trim() : existing.fullName,
      phone: phone !== undefined ? phone.trim() : existing.phone,
      addressLine1: addressLine1 !== undefined ? addressLine1.trim() : existing.addressLine1,
      addressLine2: addressLine2 !== undefined ? addressLine2.trim() : existing.addressLine2,
      landmark: landmark !== undefined ? (landmark ? landmark.trim() : null) : existing.landmark,
      city: city !== undefined ? city.trim() : existing.city,
      state: state !== undefined ? state.trim() : existing.state,
      pincode: pincode !== undefined ? pincode.trim() : existing.pincode,
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
