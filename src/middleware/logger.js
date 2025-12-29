const morgan = require('morgan');
const logger = require('../utils/logger');

/**
 * Morgan stream configuration for Winston
 */
const stream = {
  write: (message) => logger.http(message.trim()),
};

/**
 * Skip logging during tests
 */
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

/**
 * Morgan middleware configuration
 */
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = morganMiddleware;
