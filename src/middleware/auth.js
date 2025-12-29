const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const { ApiError } = require('./errorHandler');
const config = require('../config');
const User = require('../models/User');

/**
 * Protect routes - JWT authentication
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new ApiError(401, 'User not found');
    }

    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route');
  }
});

/**
 * API Key authentication
 */
const apiKeyAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    throw new ApiError(401, 'API key is required');
  }

  // Find user by API key
  const user = await User.findOne({ apiKey }).select('-password');

  if (!user) {
    throw new ApiError(401, 'Invalid API key');
  }

  req.user = user;
  next();
});

/**
 * Role-based authorization
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'User role not authorized to access this route');
    }

    next();
  };
};

/**
 * Optional authentication - attach user if token is valid
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Continue without user if token is invalid
      req.user = null;
    }
  }

  next();
});

module.exports = {
  protect,
  apiKeyAuth,
  authorize,
  optionalAuth,
};
