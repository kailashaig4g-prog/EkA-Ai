const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const ServiceHistory = require('../models/ServiceHistory');
const Vehicle = require('../models/Vehicle');
const { sendResponse, getPagination, getPaginationMetadata } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * @desc    Get service history for vehicle
 * @route   GET /api/v1/vehicles/:vehicleId/service-history
 * @access  Private
 */
const getServiceHistory = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: parsedLimit } = getPagination(page, limit);

  // Verify vehicle ownership
  const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.user.id });
  if (!vehicle) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
  }

  const serviceRecords = await ServiceHistory.find({ vehicle: vehicleId })
    .skip(skip)
    .limit(parsedLimit)
    .sort({ serviceDate: -1 });

  const total = await ServiceHistory.countDocuments({ vehicle: vehicleId });

  sendResponse(res, HTTP_STATUS.OK, true, 'Service history retrieved successfully', {
    serviceRecords,
    pagination: getPaginationMetadata(total, page, parsedLimit),
  });
});

/**
 * @desc    Get single service record
 * @route   GET /api/v1/service-history/:id
 * @access  Private
 */
const getServiceRecord = asyncHandler(async (req, res) => {
  const record = await ServiceHistory.findById(req.params.id).populate('vehicle');

  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Service record not found');
  }

  // Verify ownership
  if (record.user.toString() !== req.user.id) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Not authorized to access this record');
  }

  sendResponse(res, HTTP_STATUS.OK, true, 'Service record retrieved successfully', { record });
});

/**
 * @desc    Create service record
 * @route   POST /api/v1/vehicles/:vehicleId/service-history
 * @access  Private
 */
const createServiceRecord = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.user.id });
  if (!vehicle) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
  }

  const recordData = {
    ...req.body,
    vehicle: vehicleId,
    user: req.user.id,
  };

  const record = await ServiceHistory.create(recordData);

  // Update vehicle's last service date
  vehicle.lastServiceDate = record.serviceDate;
  if (record.nextServiceDate) {
    vehicle.nextServiceDue = record.nextServiceDate;
  }
  await vehicle.save();

  logger.info(`Service record created for vehicle ${vehicle.fullName} by ${req.user.email}`);

  sendResponse(res, HTTP_STATUS.CREATED, true, 'Service record created successfully', { record });
});

/**
 * @desc    Update service record
 * @route   PUT /api/v1/service-history/:id
 * @access  Private
 */
const updateServiceRecord = asyncHandler(async (req, res) => {
  let record = await ServiceHistory.findById(req.params.id);

  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Service record not found');
  }

  // Verify ownership
  if (record.user.toString() !== req.user.id) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Not authorized to update this record');
  }

  record = await ServiceHistory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  logger.info(`Service record updated by ${req.user.email}`);

  sendResponse(res, HTTP_STATUS.OK, true, 'Service record updated successfully', { record });
});

/**
 * @desc    Delete service record
 * @route   DELETE /api/v1/service-history/:id
 * @access  Private
 */
const deleteServiceRecord = asyncHandler(async (req, res) => {
  const record = await ServiceHistory.findById(req.params.id);

  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Service record not found');
  }

  // Verify ownership
  if (record.user.toString() !== req.user.id) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Not authorized to delete this record');
  }

  await record.deleteOne();

  logger.info(`Service record deleted by ${req.user.email}`);

  sendResponse(res, HTTP_STATUS.OK, true, 'Service record deleted successfully', null);
});

module.exports = {
  getServiceHistory,
  getServiceRecord,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
};
