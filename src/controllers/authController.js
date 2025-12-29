const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const User = require('../models/User');
const { sendResponse, sanitizeUser } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate tokens
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();

  logger.info(`New user registered: ${email}`);

  sendResponse(res, HTTP_STATUS.CREATED, true, 'User registered successfully', {
    user: sanitizeUser(user),
    token,
    refreshToken,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
  }

  // Check if account is locked
  if (user.accountLocked && user.accountLockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      `Account locked. Try again in ${minutesLeft} minutes`
    );
  }

  // Unlock account if lock period has passed
  if (user.accountLocked && user.accountLockedUntil <= Date.now()) {
    user.accountLocked = false;
    user.accountLockedUntil = null;
    user.failedLoginAttempts = 0;
    await user.save();
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    await user.handleFailedLogin();
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
  }

  // Reset failed attempts and update last login
  await user.resetFailedAttempts();

  // Generate tokens
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();

  logger.info(`User logged in: ${email}`);

  sendResponse(res, HTTP_STATUS.OK, true, 'Login successful', {
    user: sanitizeUser(user),
    token,
    refreshToken,
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  sendResponse(res, HTTP_STATUS.OK, true, 'User retrieved successfully', {
    user: sanitizeUser(user),
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phoneNumber } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (phoneNumber) user.phoneNumber = phoneNumber;

  await user.save();

  logger.info(`User profile updated: ${user.email}`);

  sendResponse(res, HTTP_STATUS.OK, true, 'Profile updated successfully', {
    user: sanitizeUser(user),
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // Here we can log the event
  logger.info(`User logged out: ${req.user.email}`);

  sendResponse(res, HTTP_STATUS.OK, true, 'Logout successful', null);
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
};
