const Bull = require('bull');
const config = require('../config');
const logger = require('../utils/logger');

class QueueService {
  constructor() {
    if (!config.features.queue) {
      logger.warn('Queue service is disabled');
      this.queues = {};
      return;
    }

    // Initialize queues
    this.queues = {
      email: new Bull('email', {
        redis: {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password || undefined,
          db: config.redis.db || 0,
        },
      }),
      notifications: new Bull('notifications', {
        redis: {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password || undefined,
          db: config.redis.db || 0,
        },
      }),
      analytics: new Bull('analytics', {
        redis: {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password || undefined,
          db: config.redis.db || 0,
        },
      }),
    };

    this.setupEventHandlers();
    logger.info('Queue service initialized');
  }

  /**
   * Setup event handlers for all queues
   */
  setupEventHandlers() {
    Object.entries(this.queues).forEach(([name, queue]) => {
      queue.on('completed', (job) => {
        logger.info(`Job ${job.id} in queue ${name} completed`);
      });

      queue.on('failed', (job, err) => {
        logger.error(`Job ${job.id} in queue ${name} failed: ${err.message}`);
      });

      queue.on('error', (err) => {
        logger.error(`Queue ${name} error: ${err.message}`);
      });
    });
  }

  /**
   * Add email to queue
   */
  async addEmail(emailData, options = {}) {
    if (!this.queues.email) {
      throw new Error('Email queue not initialized');
    }

    try {
      const job = await this.queues.email.add(emailData, {
        attempts: options.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
        ...options,
      });

      logger.info(`Email job ${job.id} added to queue`);
      return job;
    } catch (error) {
      logger.error(`Failed to add email to queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add notification to queue
   */
  async addNotification(notificationData, options = {}) {
    if (!this.queues.notifications) {
      throw new Error('Notifications queue not initialized');
    }

    try {
      const job = await this.queues.notifications.add(notificationData, {
        attempts: options.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
        ...options,
      });

      logger.info(`Notification job ${job.id} added to queue`);
      return job;
    } catch (error) {
      logger.error(`Failed to add notification to queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add analytics event to queue
   */
  async addAnalytics(analyticsData, options = {}) {
    if (!this.queues.analytics) {
      throw new Error('Analytics queue not initialized');
    }

    try {
      const job = await this.queues.analytics.add(analyticsData, {
        attempts: 2,
        removeOnComplete: true,
        removeOnFail: true,
        ...options,
      });

      return job;
    } catch (error) {
      logger.error(`Failed to add analytics to queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process email queue
   */
  processEmail(processor) {
    if (!this.queues.email) return;

    this.queues.email.process(async (job) => {
      logger.info(`Processing email job ${job.id}`);
      return await processor(job.data);
    });
  }

  /**
   * Process notification queue
   */
  processNotifications(processor) {
    if (!this.queues.notifications) return;

    this.queues.notifications.process(async (job) => {
      logger.info(`Processing notification job ${job.id}`);
      return await processor(job.data);
    });
  }

  /**
   * Process analytics queue
   */
  processAnalytics(processor) {
    if (!this.queues.analytics) return;

    this.queues.analytics.process(async (job) => {
      return await processor(job.data);
    });
  }

  /**
   * Get queue stats
   */
  async getStats(queueName) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Clear queue
   */
  async clearQueue(queueName) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.empty();
    logger.info(`Queue ${queueName} cleared`);
  }

  /**
   * Close all queues
   */
  async close() {
    const closePromises = Object.entries(this.queues).map(([name, queue]) => {
      logger.info(`Closing queue: ${name}`);
      return queue.close();
    });

    await Promise.all(closePromises);
    logger.info('All queues closed');
  }
}

module.exports = new QueueService();
