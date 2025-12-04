import type IORedis from 'ioredis';
import { type Job, Worker } from 'bullmq';
import { NotificationService, PaymentService } from '@/services';
import { logger } from '@/logger';

const QUEUE_NAME = 'customerBirthdayPromocodeJobQueue';

export default class BirthdayPromoWorker {
    private paymentService: PaymentService;
    private notificationService: NotificationService;
    private worker: Worker;

    constructor(
        paymentService: PaymentService,
        notificationService: NotificationService,
        connection: IORedis,
        concurrency: number = 50
    ) {
        this.paymentService = paymentService;
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
            const promocode =
                await this.paymentService.createDiscountCouponAndPromotionCode(
                    50,
                    job.data.stripeCustomerId
                );
            await this.notificationService.sendBirthdayPromotionCodeEmail(
                job.data.email,
                job.data.firstName,
                job.data.birthday,
                promocode
            );
        } catch (error) {
            logger.error(`Error from ${QUEUE_NAME} worker: ${error}`);
            throw new Error(`${QUEUE_NAME} worker couldn't process it.`);
        }
    }

    public listen(): void {
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
