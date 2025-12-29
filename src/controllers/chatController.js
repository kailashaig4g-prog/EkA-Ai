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

  const context = {};

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
 * @desc    Send streaming chat message to AI (SSE)
 * @route   POST /api/v1/chat/stream
 * @access  Private
 */
const sendMessageStream = asyncHandler(async (req, res) => {
  const { message, conversationHistory, vehicleId } = req.body;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const context = {};

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

  // Build messages for OpenAI
  const systemPrompt = `You are an expert automotive AI assistant. 
You help users with car maintenance, diagnostics, and advice.
Provide clear, accurate, and helpful responses.
${context.vehicle ? `User's vehicle: ${context.vehicle.make} ${context.vehicle.model} ${context.vehicle.year}` : ''}
${context.mileage ? `Current mileage: ${context.mileage} miles` : ''}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message },
  ];

  // Add conversation history
  if (conversationHistory && Array.isArray(conversationHistory)) {
    messages.splice(1, 0, ...conversationHistory.slice(-10));
  }

  try {
    // Get streaming response
    const stream = await openaiService.chatStream(messages);

    let fullResponse = '';

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
      }
    }

    // Send final message
    res.write(`data: ${JSON.stringify({ content: '', done: true, fullResponse })}\n\n`);
    res.end();

    logger.info(`Streaming chat completed for user: ${req.user.email}`);
  } catch (error) {
    logger.error(`Streaming chat error: ${error.message}`);
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
    res.end();
  }
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
  sendMessageStream,
  getSuggestions,
};
