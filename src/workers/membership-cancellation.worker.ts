import type IORedis from 'ioredis';
import { type Job, Worker } from 'bullmq';
import { NotificationService, SubscriptionService } from '@/services';
import { logger } from '@/logger';

const QUEUE_NAME = 'membershipCancellationJobQueue';

export default class MembershipCancellationWorker {
    private subscriptionService: SubscriptionService;
    private notificationService: NotificationService;
    private worker: Worker;

    constructor(
        subscriptionService: SubscriptionService,
        notificationService: NotificationService,
        connection: IORedis,
        concurrency: number = 50
    ) {
        this.subscriptionService = subscriptionService;
        this.notificationService = notificationService;
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
            return await this.subscriptionService.cancelMembership(
                job.data.stripeCustomerId
            );
        } catch (error) {
            logger.error(`Error from ${QUEUE_NAME} worker: ${error}`);
            throw new Error(`${QUEUE_NAME} worker couldn't process it.`);
        }
    }

    public listen(): void {
        this.worker.on('completed', async (job: Job, userId: number) => {
            await this.notificationService.sendNotification(
                userId,
                `Your ${job.data.membershipType} membership has ended!`
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
