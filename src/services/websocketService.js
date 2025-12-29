const logger = require('../utils/logger');

class WebSocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize WebSocket service
   */
  init(io) {
    this.io = io;
    logger.info('WebSocket service initialized');
  }

  /**
   * Send notification to user
   */
  sendNotification(userId, notification) {
    if (!this.io) {
      logger.warn('WebSocket not initialized');
      return;
    }

    this.io.to(`user:${userId}`).emit('notification', notification);
    logger.info(`Notification sent to user ${userId}`);
  }

  /**
   * Send notification to multiple users
   */
  sendBulkNotification(userIds, notification) {
    if (!this.io) {
      logger.warn('WebSocket not initialized');
      return;
    }

    userIds.forEach(userId => {
      this.io.to(`user:${userId}`).emit('notification', notification);
    });

    logger.info(`Bulk notification sent to ${userIds.length} users`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event, data) {
    if (!this.io) {
      logger.warn('WebSocket not initialized');
      return;
    }

    this.io.emit(event, data);
    logger.info(`Broadcast: ${event}`);
  }

  /**
   * Send to specific channel
   */
  sendToChannel(channel, event, data) {
    if (!this.io) {
      logger.warn('WebSocket not initialized');
      return;
    }

    this.io.to(`notifications:${channel}`).emit(event, data);
    logger.info(`Sent to channel ${channel}: ${event}`);
  }

  /**
   * Send service reminder notification
   */
  sendServiceReminder(userId, vehicleInfo) {
    this.sendNotification(userId, {
      type: 'service_reminder',
      title: 'Service Reminder',
      message: `It's time for service on your ${vehicleInfo.make} ${vehicleInfo.model}`,
      data: vehicleInfo,
      timestamp: new Date(),
    });
  }

  /**
   * Send payment notification
   */
  sendPaymentNotification(userId, paymentInfo) {
    this.sendNotification(userId, {
      type: 'payment',
      title: 'Payment Update',
      message: paymentInfo.message,
      data: paymentInfo,
      timestamp: new Date(),
    });
  }

  /**
   * Send subscription update notification
   */
  sendSubscriptionUpdate(userId, subscriptionInfo) {
    this.sendNotification(userId, {
      type: 'subscription',
      title: 'Subscription Update',
      message: subscriptionInfo.message,
      data: subscriptionInfo,
      timestamp: new Date(),
    });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount() {
    if (!this.io) return 0;
    
    return this.io.sockets.sockets.size;
  }

  /**
   * Get clients in room
   */
  async getClientsInRoom(room) {
    if (!this.io) return [];
    
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.map(s => ({
      socketId: s.id,
      userId: s.userId,
      email: s.userEmail,
    }));
  }

  /**
   * Disconnect user
   */
  disconnectUser(userId) {
    if (!this.io) return;

    this.io.in(`user:${userId}`).disconnectSockets();
    logger.info(`Disconnected user ${userId}`);
  }
}

module.exports = new WebSocketService();
