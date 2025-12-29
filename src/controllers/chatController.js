const asyncHandler = require('../middleware/asyncHandler');
const openaiService = require('../services/openaiService');
const Vehicle = require('../models/Vehicle');
const { sendResponse } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * @desc    Send chat message to AI
 * @route   POST /api/v1/chat
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { message, conversationHistory, vehicleId } = req.body;

  let context = {};

  // Get vehicle context if provided
  if (vehicleId) {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.user.id });
    if (vehicle) {
      context.vehicle = {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
      };
      context.mileage = vehicle.mileage;
    }
  }

  // Add conversation history to context
  if (conversationHistory && Array.isArray(conversationHistory)) {
    context.history = conversationHistory.slice(-10); // Last 10 messages
  }

  // Get AI response
  const response = await openaiService.automotiveChat(message, context);

  logger.info(`Chat message processed for user: ${req.user.email}`);

  sendResponse(res, HTTP_STATUS.OK, true, 'Message sent successfully', {
    response,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get chat suggestions
 * @route   GET /api/v1/chat/suggestions
 * @access  Private
 */
const getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = [
    'What should I check before a long road trip?',
    'How often should I change my oil?',
    'My check engine light is on, what should I do?',
    'What are signs of brake problems?',
    'How do I improve my fuel efficiency?',
    'When should I rotate my tires?',
  ];

  sendResponse(res, HTTP_STATUS.OK, true, 'Suggestions retrieved', {
    suggestions,
  });
});

module.exports = {
  sendMessage,
  getSuggestions,
};
