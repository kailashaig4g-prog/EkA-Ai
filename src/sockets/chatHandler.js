const openaiService = require('../services/openaiService');
const Vehicle = require('../models/Vehicle');
const logger = require('../utils/logger');

module.exports = (socket, io) => {
  socket.on('chat:stream', async (data) => {
    try {
      const { message, conversationHistory, vehicleId } = data;

      if (!message) {
        return socket.emit('chat:error', { error: 'Message is required' });
      }

      logger.info(`Streaming chat request from ${socket.userEmail}`);

      const context = {};

      if (vehicleId) {
        const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: socket.userId });
        if (vehicle) {
          context.vehicle = {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
          };
          context.mileage = vehicle.mileage;
        }
      }

      const systemPrompt = `You are an expert automotive AI assistant.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.splice(1, 0, ...conversationHistory.slice(-10));
      }

      const stream = await openaiService.chatStream(messages);

      let fullResponse = '';

      socket.emit('chat:start', { timestamp: new Date() });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          socket.emit('chat:chunk', { content });
        }
      }

      socket.emit('chat:end', { fullResponse, timestamp: new Date() });

      logger.info(`Streaming chat completed for ${socket.userEmail}`);
    } catch (error) {
      logger.error(`Streaming chat error: ${error.message}`);
      socket.emit('chat:error', { error: error.message });
    }
  });

  socket.on('chat:typing', (data) => {
    socket.broadcast.to(`user:${socket.userId}`).emit('chat:typing', {
      userId: socket.userId,
      isTyping: data.isTyping,
    });
  });

  socket.on('chat:stop', () => {
    socket.emit('chat:stopped', { message: 'Stream stopped' });
  });
};
