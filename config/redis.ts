import IORedis from 'ioredis';
import { logger } from '@/services/Logger.service';

export const connectToRedisServer = (): IORedis => {
    try {
        return new IORedis();
    } catch (error) {
        logger.error('Error connecting to Redis server: ' + error);
        throw new Error('Failed to connect to Redis server');
    }
};

export const redisClient = connectToRedisServer();
export const workerRedisClient = new IORedis({ maxRetriesPerRequest: null });
