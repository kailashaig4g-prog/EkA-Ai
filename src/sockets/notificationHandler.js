const logger = require('../utils/logger');

module.exports = (socket, io) => {
  socket.on('notification:subscribe', (data) => {
    const { channels } = data;
    
    if (channels && Array.isArray(channels)) {
      channels.forEach(channel => {
        socket.join(`notifications:${channel}`);
      });
      
      logger.info(`User ${socket.userEmail} subscribed to notification channels: ${channels.join(', ')}`);
      socket.emit('notification:subscribed', { channels });
    }
  });

  socket.on('notification:unsubscribe', (data) => {
    const { channels } = data;
    
    if (channels && Array.isArray(channels)) {
      channels.forEach(channel => {
        socket.leave(`notifications:${channel}`);
      });
      
      logger.info(`User ${socket.userEmail} unsubscribed from notification channels: ${channels.join(', ')}`);
      socket.emit('notification:unsubscribed', { channels });
    }
  });

  socket.on('notification:markRead', (data) => {
    const { notificationId } = data;
    
    logger.info(`User ${socket.userEmail} marked notification ${notificationId} as read`);
    socket.emit('notification:read', { notificationId });
  });
};
