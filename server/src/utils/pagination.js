const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');

/**
 * Parse and validate pagination params from query string
 */
const parsePagination = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || DEFAULT_PAGE_SIZE;

  if (page < 1) page = 1;
  if (limit < 1) limit = DEFAULT_PAGE_SIZE;
  if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build pagination metadata for responses
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Returns a paginated response object
 */
const paginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
  paginatedResponse,
};
