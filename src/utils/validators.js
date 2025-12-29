const { body, param, query } = require('express-validator');

/**
 * Custom validators for application-specific validation
 */

const isStrongPassword = (value) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(value);
};

const isValidVIN = (value) => {
  // Basic VIN validation (17 characters, alphanumeric, no I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return vinRegex.test(value);
};

const isValidPhoneNumber = (value) => {
  // International phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(value);
};

const validators = {
  // Auth validators
  registerValidator: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .custom(isStrongPassword)
      .withMessage(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      ),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  ],

  loginValidator: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  // Vehicle validators
  vehicleValidator: [
    body('make').trim().isLength({ min: 1, max: 50 }).withMessage('Make is required'),
    body('model').trim().isLength({ min: 1, max: 50 }).withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
    body('vin').optional().custom(isValidVIN).withMessage('Invalid VIN format'),
    body('mileage').optional().isInt({ min: 0 }).withMessage('Mileage must be a positive number'),
  ],

  // Chat validators
  chatValidator: [
    body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters'),
    body('conversationId').optional().isMongoId().withMessage('Invalid conversation ID'),
  ],

  // ID validators
  mongoIdValidator: [
    param('id').isMongoId().withMessage('Invalid ID format'),
  ],

  // Pagination validators
  paginationValidator: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
};

module.exports = {
  ...validators,
  isStrongPassword,
  isValidVIN,
  isValidPhoneNumber,
};
