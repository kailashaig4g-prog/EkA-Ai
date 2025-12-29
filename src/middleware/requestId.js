const { v4: uuidv4 } = require('uuid');

/**
 * Request ID middleware - adds unique ID to each request for tracking
 */
const requestId = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
};

module.exports = requestId;
