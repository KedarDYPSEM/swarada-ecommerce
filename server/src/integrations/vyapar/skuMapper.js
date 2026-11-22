const prisma = require('../../config/database');

/**
 * SKU and Barcode Mapping for Vyapar Gold Android
 */
const normalizeSku = (rawSku) => {
  if (!rawSku) return '';
  return rawSku.toString().trim().toUpperCase().replace(/\s+/g, '');
};

const findProductByVyaparIdentifier = async (identifier) => {
  const cleanId = normalizeSku(identifier);
  if (!cleanId) return null;

  return prisma.product.findFirst({
    where: {
      OR: [
        { sku: cleanId },
        { barcode: cleanId },
      ],
    },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });
};

module.exports = {
  normalizeSku,
  findProductByVyaparIdentifier,
};
