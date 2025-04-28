import { Queue } from 'bullmq';
import { redisClient } from '@/config/redis';
import { logger } from '@/logger';

const baseJobOptions = {
    attempts: 5, // 2^(1->2->3->4->*5(-1)) * 5000 | executions: 10000ms, 10000ms, 20000ms, 40000ms, 80000ms
    backoff: {
        type: 'exponential',
        delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 },
};

export const queue1 = new Queue('membershipCancellationJobQueue', {
    defaultJobOptions: baseJobOptions,
    connection: redisClient,
});

queue1.on('error', (err) => {
    logger.error('Error from queue1: ' + err);
});

queue1.on('removed', (job) => {
    logger.log(`Job with id "${job.id}" has been removed from queue1!`);
});

export const queue2 = new Queue('customerBirthdayPromocodeJobQueue', {
    defaultJobOptions: baseJobOptions,
    connection: redisClient,
});

queue2.on('error', (err) => {
    logger.error('Error from queue2: ' + err);
});

queue2.on('removed', (job) => {
    logger.log(`Job with id "${job.id}" has been removed from queue2!`);
});

export const queue3 = new Queue('holidayPromotionJobQueue', {
    defaultJobOptions: baseJobOptions,
    connection: redisClient,
});

queue3.on('error', (err) => {
    logger.error('Error from queue3: ' + err);
});

queue3.on('removed', (job) => {
    logger.log(`Job with id "${job.id}" has been removed from queue3!`);
});

export const queue4 = new Queue('exclusiveProductRemovalJobQueue', {
    defaultJobOptions: baseJobOptions,
    connection: redisClient,
});

queue4.on('error', (err) => {
    logger.error('Error from queue4: ' + err);
});

queue4.on('removed', (job) => {
    logger.log(`Job with id "${job.id}" has been removed from queue4!`);
});

export const queue5 = new Queue('supportAgentDetachmentJobQueue', {
    defaultJobOptions: baseJobOptions,
    connection: redisClient,
});

queue5.on('error', (err) => {
    logger.error('Error from queue5: ' + err);
});

queue5.on('removed', (job) => {
    logger.log(`Job with id "${job.id}" has been removed from queue5!`);
});
