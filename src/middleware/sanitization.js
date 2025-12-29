const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * Sanitization middleware configuration
 */
const sanitization = [
  // Prevent NoSQL injection
  mongoSanitize({
    replaceWith: '_',
  }),

  // Prevent XSS attacks
  xss(),

  // Prevent HTTP Parameter Pollution
  hpp(),
];

module.exports = sanitization;
