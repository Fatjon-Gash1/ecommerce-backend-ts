import type IORedis from 'ioredis';
import { type Job, Worker } from 'bullmq';
import { LoggingService, ProductService } from '@/services';
import { logger } from '@/logger';

const QUEUE_NAME = 'exclusiveProductRemovalJobQueue';

export default class ExclusiveProductRemovalWorker {
    private productService: ProductService;
    private loggingService: LoggingService;
    private worker: Worker;

    constructor(
        productService: ProductService,
        loggingService: LoggingService,
        connection: IORedis,
        concurrency: number = 50
    ) {
        this.productService = productService;
        this.loggingService = loggingService;
        this.worker = new Worker(
            QUEUE_NAME,
            async (job: Job) => this.processor(job),
            {
                concurrency,
                connection,
            }
        );
    }

    private async processor(job: Job) {
        try {
            await this.productService.deleteProductById(job.data.productId);
        } catch (error) {
            logger.error(`Error from ${QUEUE_NAME} worker: ${error}`);
            throw new Error(`${QUEUE_NAME} worker couldn't process it.`);
        }
    }

    public listen(): void {
        this.worker.on('completed', async (job: Job) => {
            await this.loggingService.log(
                'Exclusive Product',
                `Exclusive product "${job.data.productName}" was removed!`
            );
        });

        this.worker.on('failed', (job, err) => {
            if (!job) {
                return logger.error('Failed job not found!');
            }

            logger.error(
                `Job with id "${job.id}" has failed because ${err.message}`
            );

            logger.log('Retry attempt: ' + job.attemptsMade);
        });

        this.worker.on('error', (err) => {
            logger.error(`Error from ${QUEUE_NAME} worker: ${err}`);
        });
    }
}
