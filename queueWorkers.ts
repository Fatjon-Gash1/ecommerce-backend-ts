import { Worker } from 'bullmq';
import pLimit from 'p-limit';
import { Sequelize } from 'sequelize';
import type { Job } from 'bullmq';
import { workerRedisClient } from './config/redis';
import { logger } from '@/services/Logger.service';
import {
    SubscriptionService,
    NotificationService,
    PaymentService,
} from './services';
import { Customer, User } from './models/relational';

const subscriptionService = new SubscriptionService();
const notificationService = new NotificationService();
const paymentService = new PaymentService(process.env.STRIPE_KEY as string);

const worker1 = new Worker(
    'membershipCancellationJobQueue',
    async (job: Job) => {
        try {
            return await subscriptionService.cancelMembership(
                job.data.stripeCustomerId
            );
        } catch (error) {
            logger.error('Error from worker1: ' + error);
            throw new Error(
                '"membershipCancellationJobQueue" worker couldn\'t process it.'
            );
        }
    },
    {
        concurrency: 50,
        connection: workerRedisClient,
    }
);

worker1.on('completed', async (job: Job, userId: number) => {
    await notificationService.sendNotification(
        userId,
        `Your ${job.data.membershipType} membership has ended!`
    );
});

worker1.on('failed', async (job, err) => {
    logger.error(
        `Job${job ? ` with id "${job.id}"` : ''} has failed because ${err.message}`
    );

    if (!job) {
        return logger.error('Failed job not found!');
    }

    logger.log('Retry attempt: ' + job.attemptsMade);
});

worker1.on('error', (err) => {
    logger.error('Error from worker1: ' + err);
});

const worker2 = new Worker(
    'customerBirthdayPromocodeJobQueue',
    async (job: Job) => {
        try {
            const promocode =
                await paymentService.createDiscountCouponAndPromotionCode(
                    50,
                    job.data.stripeCustomerId
                );
            await notificationService.sendBirthdayPromotionCodeEmail(
                job.data.email,
                job.data.firstName,
                job.data.birthday,
                promocode
            );
        } catch (error) {
            logger.error('Error from worker2: ' + error);
            throw new Error(
                '"customerBirthdayPromocodeJobQueue" worker couldn\'t process it.'
            );
        }
    },
    {
        concurrency: 50,
        connection: workerRedisClient,
    }
);

worker2.on('failed', async (job, err) => {
    logger.error(
        `Job${job ? ` with id "${job.id}"` : ''} has failed because ${err.message}`
    );

    if (!job) {
        return logger.error('Failed job not found!');
    }

    logger.log('Retry attempt: ' + job.attemptsMade);
});

worker2.on('error', (err) => {
    logger.error('Error from worker2: ' + err);
});

const worker3 = new Worker(
    'holidayPromotionJobQueue',
    async (job: Job) => {
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

            const count = await Customer.update(
                {
                    loyaltyPoints: Sequelize.literal(
                        `loyaltyPoints + ${job.data.promotion.loyaltyPoints}`
                    ),
                },
                { where: {} }
            );
            logger.log('Affected count: ' + count);

            const holidayPromotionEmailPromises = customers.map((customer) => {
                return limit(async () => {
                    let promocode: string | null = null;

                    if (job.data.promotion.promotionCode) {
                        promocode =
                            await paymentService.createDiscountCouponAndPromotionCode(
                                job.data.promotion.percentOff,
                                customer.stripeId
                            );
                    }

                    return notificationService.sendHolidayPromotionEmail(
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
            logger.error('Error from worker3: ' + error);
            throw new Error(
                '"holidayPromotionJobQueue" worker couldn\'t process it.'
            );
        }
    },
    {
        concurrency: 50,
        connection: workerRedisClient,
    }
);

worker3.on('failed', async (job, err) => {
    logger.error(
        `Job${job ? ` with id "${job.id}"` : ''} has failed because ${err.message}`
    );

    if (!job) {
        return logger.error('Failed job not found!');
    }

    logger.log('Retry attempt: ' + job.attemptsMade);
});

worker3.on('error', (err) => {
    logger.error('Error from worker3: ' + err);
});
