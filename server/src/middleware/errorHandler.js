class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Format Multer File Size limit (20MB)
  if (err.code === 'LIMIT_FILE_SIZE') {
    err.statusCode = 400;
    err.status = 'fail';
    err.isOperational = true;
    err.message = 'File size exceeds 20MB limit. Please upload an image or video under 20MB.';
  }

  // Format Prisma Unique Constraint Violations (P2002)
  if (err.code === 'P2002' || (err.message && err.message.includes('Unique constraint failed'))) {
    err.statusCode = 400;
    err.status = 'fail';
    err.isOperational = true;
    const target = err.meta?.target || (err.message.includes('products_barcode_key') ? 'barcode' : err.message.includes('products_sku_key') ? 'sku' : 'field');
    if (target === 'barcode' || String(target).includes('barcode')) {
      err.message = 'The barcode / tag ID entered is already in use by another product. Please use a unique barcode or leave it blank.';
    } else if (target === 'sku' || String(target).includes('sku')) {
      err.message = 'This SKU is already assigned to another product. Each product must have a unique SKU.';
    } else {
      err.message = `A unique constraint failed on ${Array.isArray(target) ? target.join(', ') : target}. Please provide unique values.`;
    }
  }

  // Format Prisma Foreign Key Violations (P2003)
  if (err.code === 'P2003') {
    err.statusCode = 400;
    err.status = 'fail';
    err.isOperational = true;
    err.message = 'A referenced record (category, user, or parent item) was not found.';
  }

  // Format Prisma Client Validation Errors
  if (err.name === 'PrismaClientValidationError') {
    err.statusCode = 400;
    err.status = 'fail';
    err.isOperational = true;
    err.message = 'Invalid data provided for database operation. Please check all fields.';
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // Production
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Programming or unknown error
  console.error('ERROR 💥:', err);
  return res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong',
  });
};

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  catchAsync,
  errorHandler,
};
