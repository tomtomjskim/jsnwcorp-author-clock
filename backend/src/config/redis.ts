import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

// Redis configuration
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  password: process.env.REDIS_PASSWORD,
};

// Create Redis client
const redisClient: RedisClientType = createClient(redisConfig);

// Error handler
redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

// Connect event
redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

// Ready event
redisClient.on('ready', () => {
  logger.info('Redis Client Ready');
});

/**
 * Connect to Redis
 */
export async function connectRedis(): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('Redis connected successfully');
    }
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    throw error;
  }
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting from Redis', error);
    throw error;
  }
}

/**
 * Get value from Redis
 * @param key Cache key
 * @returns Cached value or null
 */
export async function get(key: string): Promise<string | null> {
  try {
    const value = await redisClient.get(key);
    logger.debug(`Redis GET: ${key}`, { found: !!value });
    return value;
  } catch (error) {
    logger.error(`Redis GET error: ${key}`, error);
    return null;
  }
}

/**
 * Set value in Redis with optional TTL
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds (optional)
 */
export async function set(
  key: string,
  value: string,
  ttl?: number
): Promise<void> {
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
    logger.debug(`Redis SET: ${key}`, { ttl });
  } catch (error) {
    logger.error(`Redis SET error: ${key}`, error);
    throw error;
  }
}

/**
 * Delete key from Redis
 * @param key Cache key
 */
export async function del(key: string): Promise<void> {
  try {
    await redisClient.del(key);
    logger.debug(`Redis DEL: ${key}`);
  } catch (error) {
    logger.error(`Redis DEL error: ${key}`, error);
    throw error;
  }
}

/**
 * Check if key exists
 * @param key Cache key
 * @returns True if key exists
 */
export async function exists(key: string): Promise<boolean> {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    logger.error(`Redis EXISTS error: ${key}`, error);
    return false;
  }
}

/**
 * Get JSON value from Redis
 * @param key Cache key
 * @returns Parsed JSON object or null
 */
export async function getJSON<T = any>(key: string): Promise<T | null> {
  try {
    const value = await get(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error) {
    logger.error(`Redis getJSON error: ${key}`, error);
    return null;
  }
}

/**
 * Set JSON value in Redis
 * @param key Cache key
 * @param value Object to cache
 * @param ttl Time to live in seconds (optional)
 */
export async function setJSON(
  key: string,
  value: any,
  ttl?: number
): Promise<void> {
  try {
    const jsonString = JSON.stringify(value);
    await set(key, jsonString, ttl);
  } catch (error) {
    logger.error(`Redis setJSON error: ${key}`, error);
    throw error;
  }
}

export default redisClient;
