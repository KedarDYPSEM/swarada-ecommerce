const { v4: uuidv4 } = require('uuid');

/**
 * Generates a human-readable order number.
 * Format: SSC-YYYYMMDD-XXXX (e.g., SSC-20261122-A3B7)
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = uuidv4().slice(0, 4).toUpperCase();
  return `SSC-${dateStr}-${suffix}`;
};

/**
 * Generates an invoice number.
 * Format: INV-YYYYMMDD-XXXX
 */
const generateInvoiceNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = uuidv4().slice(0, 4).toUpperCase();
  return `INV-${dateStr}-${suffix}`;
};

module.exports = {
  generateOrderNumber,
  generateInvoiceNumber,
};
