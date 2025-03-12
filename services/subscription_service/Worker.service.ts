import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sequelize } from '@/config/db';
import { workerRedisClient } from '@/config/redis';
import { PaymentService } from '../Payment.service';
import { OrderService } from '../Order.service';
import { ShippingService } from '../Shipping.service';
import { NotificationService } from '../Notification.service';
import { LoggerService } from '../Logger.service';
import { Replenishment, Customer, User } from '@/models/relational';
import { PlatformData } from '@/models/document';
import { UserNotFoundError } from '@/errors';
import type { Transaction } from 'sequelize';
import type { Job } from 'bullmq';

const CLIENT_URL = process.env.CLIENT_URL as string;

export class WorkerService {
    private connection: IORedis;
    private queueName: string;
    private worker: Worker;
    private paymentService: PaymentService;
    private notificationService: NotificationService;
    private logger: LoggerService;

    constructor(queueName: string) {
        this.connection = workerRedisClient;
        this.queueName = queueName;
        this.worker = this.instantiateWorker();
        this.paymentService = new PaymentService(
            process.env.STRIPE_KEY as string,
            undefined,
            new ShippingService()
        );
        this.notificationService = new NotificationService();
        this.logger = new LoggerService();
    }

    private instantiateWorker(): Worker {
        return new Worker(
            this.queueName,
            async (job: Job) => {
                try {
                    return await this.paymentService.processPayment(
                        job.data.userId,
                        job.data
                    );
                } catch (error) {
                    this.logger.error('Error from worker: ' + error);
                    throw new Error(
                        `"${this.queueName}" worker couldn't process it.`
                    );
                }
            },
            {
                concurrency: 50,
                connection: this.connection,
            }
        );
    }

    public listen() {
        this.worker.on('completed', async (job: Job, returnData) => {
            this.logger.log(`Job: ${job.id} has completed`);

            const currentTime = Date.now();
            const paymentDate = new Date().toISOString().split('T')[0];
            const nextPaymentDate = new Date(currentTime + job.data.period)
                .toISOString()
                .split('T')[0];
            const deliveryDate = new Date(currentTime + 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
            const nextReplenishmentDate = new Date(
                currentTime + 24 * 60 * 60 * 1000 + job.data.period
            )
                .toISOString()
                .split('T')[0];
            const paymentAmount = new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
            }).format(returnData.paymentAmount);

            const orderService = new OrderService();

            const transaction: Transaction = await sequelize.transaction();

            try {
                const customer = await Customer.findOne({
                    where: { userId: job.data.userId },
                    include: {
                        model: User,
                        as: 'user',
                    },
                    transaction,
                });

                if (!customer || !customer.user) {
                    throw new UserNotFoundError('Customer not found');
                }

                const order = await orderService.createOrder(
                    job.data.userId,
                    job.data.orderItems,
                    job.data.paymentMethod,
                    job.data.shippingCountry,
                    returnData.weightRange,
                    'next-day',
                    returnData.paymentAmount,
                    returnData.paymentIntentId,
                    transaction
                );

                const replenishment = await Replenishment.findByPk(
                    job.data.replenishmentId,
                    { transaction }
                );

                if (!replenishment) {
                    throw new Error('Replenishment not found');
                }

                if (
                    replenishment.status === 'scheduled' ||
                    replenishment.status === 'failed'
                ) {
                    replenishment.status = 'active';
                }

                replenishment.orderId = order.id;
                replenishment.lastPaymentDate = paymentDate;
                replenishment.executions!++;

                if (
                    (replenishment.endDate &&
                        new Date(nextPaymentDate) >=
                            new Date(replenishment.endDate)) ||
                    (replenishment.times &&
                        replenishment.executions! >= replenishment.times)
                ) {
                    replenishment.status = 'finished';
                    replenishment.nextPaymentDate = null;
                    await this.connection.del(replenishment.nextJobId!);
                    replenishment.nextJobId = null;
                } else if (replenishment.status !== 'canceled') {
                    await this.connection.del(replenishment.nextJobId!);
                    replenishment.nextPaymentDate = nextPaymentDate;

                    const nextJobId = (
                        await this.connection.zrange(
                            `bull:${this.queueName}:delayed`,
                            0,
                            -1
                        )
                    )
                        .filter((item) =>
                            item.startsWith(
                                `repeat:${replenishment.schedulerId}:`
                            )
                        )
                        .toString();

                    if (nextJobId.length !== 0) {
                        replenishment.nextJobId = `orderData:${nextJobId}`;

                        await this.connection.hset(`orderData:${nextJobId}`, {
                            paymentMethod: job.data.paymentMethod,
                            shippingCountry: job.data.shippingCountry,
                            orderItems: JSON.stringify(job.data.orderItems),
                        });
                    }
                }

                await replenishment.save({ transaction });

                await transaction.commit();

                const platform = (await PlatformData.find({}))[0];

                await this.notificationService.sendReplenishmentPaymentEmail(
                    customer.user.email,
                    'Replenishment payment finished',
                    'successful-payment-email.hbs',
                    {
                        customerName: `${customer.user.firstName} ${customer.user.lastName}`,
                        orderTrackingNumber: order.trackingNumber!,
                        deliveryDate,
                        paymentAmount,
                        deliveryAddress: customer.shippingAddress!,
                        subscriptionStateInfo:
                            replenishment.endDate &&
                            new Date(nextPaymentDate) >=
                                new Date(replenishment.endDate)
                                ? `This subscription is set to expire at: <b>${new Date(replenishment.endDate).toISOString().split('T')[0]}</b>.<br>
                                No more replenishments will be sent.`
                                : replenishment.times &&
                                    replenishment.executions! >=
                                        replenishment.times
                                  ? `This subscription is set to expire after <b>${replenishment.times}</b> replenishments.<br>
                                  No more replenishments will be sent.`
                                  : `The next replenishment date is: <b>${nextReplenishmentDate}</b>.`,
                        manageSubscriptionLink: `${CLIENT_URL}/subscriptions/replenishments`,
                        customerSupportEmail: platform.customerSupportEmail,
                        customerSupportPhoneNumber:
                            platform.customerSupportPhoneNumber,
                    }
                );
            } catch (error) {
                await transaction.rollback();
                this.logger.error(
                    "Error from worker's complete event: " + error
                );
            }
        });

        this.worker.on('failed', async (job, err) => {
            this.logger.error(
                `Job${job ? ` with id "${job.id}"` : ''} has failed because ${err.message}`
            );

            if (!job) {
                return this.logger.error('Failed job not found!');
            }

            this.logger.log('Retry attempt: ' + job.attemptsMade);

            if (job.attemptsMade === 1) {
                try {
                    const customer = await Customer.findOne({
                        where: { userId: job.data.userId },
                        attributes: [],
                        include: {
                            model: User,
                            as: 'user',
                            attributes: ['email'],
                        },
                    });

                    if (!customer) {
                        throw new UserNotFoundError('Customer not found');
                    }

                    const replenishment = await Replenishment.findByPk(
                        job.data.replenishmentId
                    );

                    if (!replenishment) {
                        throw new Error('Replenishment not found');
                    }

                    replenishment.status = 'failed';
                    await this.connection.del(replenishment.nextJobId!);
                    replenishment.nextJobId = null;

                    await replenishment.save();

                    const platform = (await PlatformData.find({}))[0];

                    await this.notificationService.sendReplenishmentPaymentEmail(
                        customer.user!.email,
                        'Replenishment payment failed',
                        'failed-payment-email.hbs',
                        {
                            manageSubscriptionLink: `${CLIENT_URL}/subscriptions/replenishments`,
                            customerSupportEmail: platform.customerSupportEmail,
                            customerSupportPhoneNumber:
                                platform.customerSupportPhoneNumber,
                        }
                    );
                } catch (err) {
                    if (err instanceof UserNotFoundError) {
                        return this.logger.error(
                            `Email on failed replenishment payment could not be sent. Customer with userId "${job.data.userId}" was not found.`
                        );
                    }

                    this.logger.error(
                        'Email on failed replenishment payment could not be sent. An unexpected error occurred: ' +
                            err
                    );
                }
            }
        });

        this.worker.on('error', (err) => {
            this.logger.error('Error from worker: ' + err);
        });
    }
}
