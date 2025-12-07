import type IORedis from 'ioredis';
import { type BaseJobOptions, Queue } from 'bullmq';
import { logger } from '@/logger';

const QUEUE_NAME = 'customerBirthdayPromocodeJobQueue';

export default class BirthdayPromoQueue extends Queue {
    public readonly name = QUEUE_NAME;

    constructor(defaultJobOptions: BaseJobOptions, connection: IORedis) {
        super(QUEUE_NAME, {
            defaultJobOptions,
            connection,
        });
    }

    public listen(): void {
        this.on('error', (err) => {
            logger.error(`Error from ${this.name}: ` + err);
        });

        this.on('removed', (jobId) => {
            logger.log(
                `Job with id "${jobId}" has been removed from ${this.name}!`
            );
        });
    }
}
