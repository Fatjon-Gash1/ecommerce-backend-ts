import IORedis from 'ioredis';
import { logger } from '../logger';

export const connectToRedisServer = (): IORedis => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return new IORedis(process.env.REDIS_URL);
        } else {
            return new IORedis(process.env.REDIS_PORT);
        }
    } catch (error) {
        logger.error('Error connecting to Redis server: ' + error);
        throw new Error('Failed to connect to Redis server');
    }
};

// Shared clients
export const redisClient = connectToRedisServer();
export const workerRedisClient =
    process.env.NODE_ENV === 'production'
        ? new IORedis(process.env.REDIS_URL, {
              maxRetriesPerRequest: null,
          })
        : new IORedis(process.env.REDIS_PORT, { maxRetriesPerRequest: null });
