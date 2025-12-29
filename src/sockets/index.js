const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const chatHandler = require('./chatHandler');
const notificationHandler = require('./notificationHandler');
const presenceHandler = require('./presenceHandler');

/**
 * Socket.IO authentication middleware
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    
    logger.info(`Socket authenticated: ${socket.userEmail} (${socket.id})`);
    next();
  } catch (error) {
    logger.error(`Socket authentication failed: ${error.message}`);
    next(new Error('Authentication failed'));
  }
};

/**
 * Initialize Socket.IO handlers
 */
module.exports = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.userEmail})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Setup handlers
    chatHandler(socket, io);
    notificationHandler(socket, io);
    presenceHandler(socket, io);

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} (Reason: ${reason})`);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Successfully connected to EkA-Ai',
      userId: socket.userId,
      socketId: socket.id,
    });
  });

  logger.info('Socket.IO handlers initialized');
};
