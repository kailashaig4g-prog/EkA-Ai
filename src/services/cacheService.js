const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    if (config.features.caching) {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db || 0,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on('connect', () => {
        logger.info('Redis cache connected');
      });

      this.client.on('error', (err) => {
        logger.error(`Redis cache error: ${err.message}`);
      });
    } else {
      this.client = null;
      logger.warn('Caching is disabled');
    }

    // Default TTLs (in seconds)
    this.ttl = {
      chatResponses: 3600, // 1 hour
      vehicleData: 3600, // 1 hour
      workshopData: 1800, // 30 minutes
      translations: 604800, // 7 days
      userSession: 86400, // 24 hours
      apiResponse: 300, // 5 minutes
    };
  }

  /**
   * Check if caching is enabled
   */
  isEnabled() {
    return this.client !== null;
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isEnabled()) return null;

    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      logger.error(`Cache get error: ${error.message}`);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = null) {
    if (!this.isEnabled()) return false;

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key) {
    if (!this.isEnabled()) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern) {
    if (!this.isEnabled()) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Cache delete pattern error: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isEnabled()) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error: ${error.message}`);
      return false;
    }
  }

  /**
   * Set TTL on existing key
   */
  async expire(key, ttl) {
    if (!this.isEnabled()) return false;

    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error(`Cache expire error: ${error.message}`);
      return false;
    }
  }

  /**
   * Increment value
   */
  async incr(key) {
    if (!this.isEnabled()) return 0;

    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Cache increment error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Decrement value
   */
  async decr(key) {
    if (!this.isEnabled()) return 0;

    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error(`Cache decrement error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet(key, fetchFn, ttl = null) {
    if (!this.isEnabled()) {
      return await fetchFn();
    }

    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch fresh data
      const fresh = await fetchFn();
      
      // Store in cache
      await this.set(key, fresh, ttl);
      
      return fresh;
    } catch (error) {
      logger.error(`Cache getOrSet error: ${error.message}`);
      // Fall back to fetching fresh data
      return await fetchFn();
    }
  }

  /**
   * Cache chat response
   */
  async cacheChat(userId, message, response) {
    const key = `chat:${userId}:${Buffer.from(message).toString('base64').substring(0, 50)}`;
    return await this.set(key, response, this.ttl.chatResponses);
  }

  /**
   * Get cached chat response
   */
  async getCachedChat(userId, message) {
    const key = `chat:${userId}:${Buffer.from(message).toString('base64').substring(0, 50)}`;
    return await this.get(key);
  }

  /**
   * Cache vehicle data
   */
  async cacheVehicle(vehicleId, data) {
    const key = `vehicle:${vehicleId}`;
    return await this.set(key, data, this.ttl.vehicleData);
  }

  /**
   * Get cached vehicle data
   */
  async getCachedVehicle(vehicleId) {
    const key = `vehicle:${vehicleId}`;
    return await this.get(key);
  }

  /**
   * Cache translation
   */
  async cacheTranslation(text, targetLang, translation) {
    const textHash = Buffer.from(text).toString('base64').substring(0, 50);
    const key = `translation:${targetLang}:${textHash}`;
    return await this.set(key, translation, this.ttl.translations);
  }

  /**
   * Get cached translation
   */
  async getCachedTranslation(text, targetLang) {
    const textHash = Buffer.from(text).toString('base64').substring(0, 50);
    const key = `translation:${targetLang}:${textHash}`;
    return await this.get(key);
  }

  /**
   * Cache workshop data
   */
  async cacheWorkshop(location, data) {
    const key = `workshop:${location}`;
    return await this.set(key, data, this.ttl.workshopData);
  }

  /**
   * Get cached workshop data
   */
  async getCachedWorkshop(location) {
    const key = `workshop:${location}`;
    return await this.get(key);
  }

  /**
   * Clear all cache
   */
  async clear() {
    if (!this.isEnabled()) return false;

    try {
      await this.client.flushdb();
      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error(`Cache clear error: ${error.message}`);
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis cache connection closed');
    }
  }
}

module.exports = new CacheService();
