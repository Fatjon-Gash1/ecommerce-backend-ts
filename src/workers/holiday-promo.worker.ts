import type IORedis from 'ioredis';
import { type Job, Worker } from 'bullmq';
import { NotificationService, PaymentService } from '@/services';
import { logger } from '@/logger';
import pLimit from 'p-limit';
import { Customer, User } from '@/models/relational';
import { Sequelize } from 'sequelize';

const QUEUE_NAME = 'holidayPromotionJobQueue';

export default class HolidayPromoWorker {
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
            const limit = pLimit(10);
            const customers = await Customer.findAll({
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['email', 'firstName'],
                },
                attributes: ['stripeId'],
            });

            await Customer.update(
                {
                    loyaltyPoints: Sequelize.literal(
                        `loyaltyPoints + ${job.data.promotion.loyaltyPoints}`
                    ),
                },
                { where: {} }
            );

            const holidayPromotionEmailPromises = customers.map((customer) => {
                return limit(async () => {
                    let promocode: string | null = null;

                    if (job.data.promotion.promotionCode) {
                        promocode =
                            await this.paymentService.createDiscountCouponAndPromotionCode(
                                job.data.promotion.percentOff,
                                customer.stripeId
                            );
                    }

                    return this.notificationService.sendHolidayPromotionEmail(
                        customer.user!.email,
                        customer.user!.firstName,
                        job.data.holidayName,
                        job.data.promotion.loyaltyPoints,
                        promocode,
                        job.data.promotion.percentOff
                    );
                });
            });

            await Promise.allSettled(holidayPromotionEmailPromises);
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
