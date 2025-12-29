const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Vehicle = require('../models/Vehicle');
const { sendResponse, getPagination, getPaginationMetadata } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * @desc    Get all vehicles for user
 * @route   GET /api/v1/vehicles
 * @access  Private
 */
const getVehicles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  const vehicles = await Vehicle.find({ owner: req.user.id, isActive: true })
    .skip(skip)
    .limit(parsedLimit)
    .sort({ createdAt: -1 });

  const total = await Vehicle.countDocuments({ owner: req.user.id, isActive: true });

  sendResponse(res, HTTP_STATUS.OK, true, 'Vehicles retrieved successfully', {
    vehicles,
    pagination: getPaginationMetadata(total, page, parsedLimit),
  });
});

/**
 * @desc    Get single vehicle
 * @route   GET /api/v1/vehicles/:id
 * @access  Private
 */
const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id });

  if (!vehicle) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
  }

  sendResponse(res, HTTP_STATUS.OK, true, 'Vehicle retrieved successfully', { vehicle });
});

/**
 * @desc    Create new vehicle
 * @route   POST /api/v1/vehicles
 * @access  Private
 */
const createVehicle = asyncHandler(async (req, res) => {
  const vehicleData = {
    ...req.body,
    owner: req.user.id,
  };

  const vehicle = await Vehicle.create(vehicleData);

  logger.info(`Vehicle created: ${vehicle.fullName} by user ${req.user.email}`);

  sendResponse(res, HTTP_STATUS.CREATED, true, 'Vehicle created successfully', { vehicle });
});

/**
 * @desc    Update vehicle
 * @route   PUT /api/v1/vehicles/:id
 * @access  Private
 */
const updateVehicle = asyncHandler(async (req, res) => {
  let vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id });

  if (!vehicle) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
  }

  vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  logger.info(`Vehicle updated: ${vehicle.fullName} by user ${req.user.email}`);

  sendResponse(res, HTTP_STATUS.OK, true, 'Vehicle updated successfully', { vehicle });
});

/**
 * @desc    Delete vehicle (soft delete)
 * @route   DELETE /api/v1/vehicles/:id
 * @access  Private
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id });

  if (!vehicle) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
  }

  vehicle.isActive = false;
  await vehicle.save();

  logger.info(`Vehicle deleted: ${vehicle.fullName} by user ${req.user.email}`);

  sendResponse(res, HTTP_STATUS.OK, true, 'Vehicle deleted successfully', null);
});

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
