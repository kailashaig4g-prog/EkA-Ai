const logger = require('../utils/logger');

const onlineUsers = new Map();

module.exports = (socket, io) => {
  socket.on('presence:online', () => {
    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      email: socket.userEmail,
      status: 'online',
      lastSeen: new Date(),
    });

    socket.broadcast.emit('presence:userOnline', {
      userId: socket.userId,
      email: socket.userEmail,
    });

    logger.info(`User ${socket.userEmail} is now online`);
  });

  socket.on('presence:away', () => {
    const user = onlineUsers.get(socket.userId);
    if (user) {
      user.status = 'away';
      user.lastSeen = new Date();
      onlineUsers.set(socket.userId, user);
    }

    socket.broadcast.emit('presence:userAway', {
      userId: socket.userId,
      email: socket.userEmail,
    });

    logger.info(`User ${socket.userEmail} is now away`);
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.userId);
    if (user) {
      user.status = 'offline';
      user.lastSeen = new Date();
      onlineUsers.set(socket.userId, user);
    }

    socket.broadcast.emit('presence:userOffline', {
      userId: socket.userId,
      email: socket.userEmail,
      lastSeen: new Date(),
    });
  });

  socket.on('presence:getOnlineUsers', () => {
    const users = Array.from(onlineUsers.values()).filter(u => u.status === 'online');
    socket.emit('presence:onlineUsers', { users });
  });
};
