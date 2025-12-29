const Redis = require('ioredis');
const logger = require('../utils/logger');
const config = require('./index');

let redisClient = null;

const connectRedis = () => {
  try {
    const options = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    redisClient = new Redis(options);

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis connection error: ${err.message}`);
    });

    redisClient.on('ready', () => {
      logger.info('Redis ready to accept commands');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    return redisClient;
  } catch (error) {
    logger.error(`Error setting up Redis: ${error.message}`);
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = connectRedis();
  }
  return redisClient;
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  closeRedis,
};
