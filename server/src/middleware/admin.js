const { authenticate, requireRole } = require('./auth');

/**
 * Convenience middleware combining authentication and ADMIN/SUPER_ADMIN role check
 */
const requireAdmin = [authenticate, requireRole('ADMIN', 'SUPER_ADMIN')];

module.exports = { requireAdmin };
