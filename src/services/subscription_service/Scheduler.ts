import { Queue } from 'bullmq';
import { redisClient } from '@/config/redis';
import {
    Customer,
    Replenishment,
    ReplenishmentPayment,
} from '@/models/relational';
import { Logger } from '@/logger';
import { UserNotFoundError } from '@/errors';
import type IORedis from 'ioredis';
import {
    ReplenishmentData,
    Units,
    ReplenishmentCreateData,
    ReplenishmentUpdateData,
    Unit,
    Status,
} from '@/types';

export class Scheduler {
    protected connection: IORedis;
    protected queue: Queue; // A queue for scheduled recurring payments
    private logger: Logger;

    constructor(queueName: string) {
        this.connection = redisClient;
        this.queue = this.createQueue(queueName);
        this.logger = new Logger();
    }

    protected createQueue(queueName: string): Queue {
        return new Queue(queueName, {
            defaultJobOptions: {
                attempts: 5, // 2^(1->2->3->4->*5(-1)) * 5000 | executions: 10000ms, 10000ms, 20000ms, 40000ms, 80000ms
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
            connection: this.connection,
        });
    }

    public getQueue(): Queue {
        return this.queue;
    }

    public async createReplenishment(
        userId: number,
        data: ReplenishmentData,
        interval: number,
        unit: Unit,
        starting?: string,
        expiry?: string,
        times?: number
    ): Promise<void> {
        const milliseconds = this.convertToMilliseconds(interval, unit);
        const startDate = new Date().toISOString();

        const customer = await Customer.findOne({
            where: { userId },
        });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const schedulerId: string = this.generateId('scheduler');

        const replenishmentData: ReplenishmentCreateData = {
            schedulerId,
            customerId: customer.id!,
            unit,
            interval,
            startDate: starting ? new Date(starting).toISOString() : startDate,
            endDate: expiry && new Date(expiry).toISOString(),
            times,
            status: starting ? 'scheduled' : 'active',
        };

        const replenishment = await Replenishment.create(replenishmentData);

        const job = await this.queue.upsertJobScheduler(
            schedulerId,
            {
                every: milliseconds,
                startDate: starting && new Date(starting).toISOString(),
                endDate: replenishment.endDate,
                limit: times,
            },
            {
                name: 'replenishment-payment',
                data: {
                    ...data,
                    shippingMethod: 'next-day',
                    userId,
                    period: milliseconds,
                    replenishmentId: replenishment.id,
                },
                opts: {
                    removeOnComplete: true,
                    removeOnFail: { age: 24 * 3600 },
                },
            }
        );

        if (!job || !job.id) {
            throw new Error('Failed to schedule job');
        }

        await this.connection.hset(`orderData:${job.id}`, {
            paymentMethod: data.paymentMethod,
            shippingCountry: data.shippingCountry,
            orderItems: JSON.stringify(data.orderItems),
        });

        await replenishment.update({ nextJobId: `orderData:${job.id}` });
    }

    public async updateReplenishment(
        userId: number,
        replenishmentId: number,
        data: ReplenishmentData,
        interval: number,
        unit: Unit,
        starting?: string,
        expiry?: string,
        times?: number
    ): Promise<void> {
        const customer = await Customer.findOne({
            where: { userId },
        });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const replenishment = await Replenishment.findByPk(replenishmentId);

        if (!replenishment) {
            throw new Error('Replenishment not found');
        }

        switch (replenishment.status) {
            case 'finished':
            case 'failed':
                throw new Error(
                    `"${replenishment.status}" replenishments cannot be updated`
                );

            case 'scheduled':
                if (!starting) {
                    throw new Error(
                        'Replenishment has a status of "scheduled". A starting date must be provided for updates.'
                    );
                }
                break;

            case 'active':
                if (starting) {
                    throw new Error(
                        'A starting date is not allowed for active replenishment updates'
                    );
                }
                break;
            case 'canceled':
                throw new Error('A canceled replenishment cannot be updated');
        }

        const milliseconds: number = this.convertToMilliseconds(interval, unit);
        const nextPaymentDate: string | undefined = this.getNextPaymentDate(
            replenishment,
            milliseconds
        );

        const paymentCount = await ReplenishmentPayment.count({
            where: { replenishmentId },
        });

        const evalTimes: number | undefined =
            times && times > paymentCount ? times - paymentCount : times;

        const replenishmentData: ReplenishmentUpdateData = {
            unit,
            interval,
            startDate: starting ? new Date(starting).toISOString() : undefined,
            endDate: expiry && new Date(expiry).toISOString(),
            times,
            nextPaymentDate,
            executions: times && (times <= paymentCount ? 0 : paymentCount),
        };

        const newJob = await this.queue.upsertJobScheduler(
            replenishment.schedulerId,
            {
                every: milliseconds,
                startDate:
                    (starting && new Date(starting).toISOString()) ||
                    nextPaymentDate,
                endDate:
                    ((expiry && new Date(expiry).toISOString()) ||
                        replenishment.endDate) ??
                    undefined,
                limit:
                    (evalTimes ||
                        (replenishment.times &&
                            replenishment.times - paymentCount)) ??
                    undefined,
            },
            {
                name: 'replenishment-payment',
                data: {
                    ...data,
                    shippingMethod: 'next-day',
                    userId,
                    period: milliseconds,
                    replenishmentId,
                },
                opts: {
                    removeOnComplete: true,
                    removeOnFail: { age: 24 * 3600 },
                },
            }
        );

        if (!newJob || !newJob.id) {
            throw new Error('Failed to schedule job');
        }

        await this.connection.del(replenishment.nextJobId!);

        await this.connection.hset(`orderData:${newJob.id}`, {
            paymentMethod: data.paymentMethod,
            shippingCountry: data.shippingCountry,
            orderItems: JSON.stringify(data.orderItems),
        });

        await replenishment.update({
            nextJobId: `orderData:${newJob.id}`,
            ...replenishmentData,
        });
    }

    public async toggleCancelStatusOnReplenishment(
        userId: number,
        replenishmentId: number
    ): Promise<void> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const replenishment = await Replenishment.findOne({
            where: { id: replenishmentId, customerId: customer.id },
        });

        if (!replenishment) {
            throw new Error('Replenishment not found');
        }

        switch (replenishment.status) {
            case 'finished':
            case 'failed':
                throw new Error(
                    `"${replenishment.status}" replenishments cannot be canceled`
                );
            case 'active':
            case 'scheduled': {
                await this.queue.removeJobScheduler(replenishment.schedulerId);

                await replenishment.update({
                    status: 'canceled',
                    nextPaymentDate: null,
                });

                return;
            }

            case 'canceled': {
                if (!replenishment.nextJobId) {
                    throw new Error(
                        'Cannot revert status from canceled. Next job id is null'
                    );
                }

                const storedData = await this.connection.hgetall(
                    replenishment.nextJobId
                );

                storedData.orderItems = JSON.parse(storedData.orderItems);

                const oldMilliseconds = this.convertToMilliseconds(
                    replenishment.interval,
                    replenishment.unit
                );

                const nextPaymentDate: string | undefined =
                    this.getNextPaymentDate(replenishment, oldMilliseconds);
                const currentStatus: Status =
                    new Date(replenishment.startDate) > new Date()
                        ? 'scheduled'
                        : 'active';

                const newJob = await this.queue.upsertJobScheduler(
                    replenishment.schedulerId,
                    {
                        every: oldMilliseconds,
                        startDate:
                            currentStatus === 'scheduled'
                                ? replenishment.startDate
                                : nextPaymentDate,
                        endDate: replenishment.endDate ?? undefined, // Doesn't allow null return
                        limit: replenishment.times ?? undefined,
                    },
                    {
                        name: 'replenishment-payment',
                        data: {
                            orderItems: storedData.orderItems,
                            paymentMethod: storedData.paymentMethod,
                            shippingCountry: storedData.shippingCountry,
                            shippingMethod: 'next-day',
                            paymentMethodId: undefined, // For now
                            currency: 'eur', // For now
                            userId,
                            period: oldMilliseconds,
                            replenishmentId,
                        },
                        opts: {
                            removeOnComplete: true,
                            removeOnFail: { age: 24 * 3600 },
                        },
                    }
                );

                if (!newJob || !newJob.id) {
                    throw new Error('Failed to schedule job');
                }

                await this.connection.del(replenishment.nextJobId!);

                await this.connection.hset(`orderData:${newJob.id}`, {
                    paymentMethod: storedData.paymentMethod,
                    shippingCountry: storedData.shippingCountry,
                    orderItems: JSON.stringify(storedData.orderItems),
                });
                await replenishment.update({
                    nextJobId: `orderData:${newJob.id}`,
                    status: currentStatus,
                    nextPaymentDate,
                });
            }
        }
    }

    public async removeReplenishment(
        userId: number,
        replenishmentId: number
    ): Promise<void> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const replenishment = await Replenishment.findOne({
            where: { id: replenishmentId, customerId: customer.id },
        });

        if (!replenishment) {
            throw new Error('Replenishment not found');
        }

        await this.queue.removeJobScheduler(replenishment.schedulerId);

        await this.connection.del(replenishment.nextJobId!);

        await replenishment.destroy();
    }

    private generateId(type: string): string {
        const currentTime = Date.now().toString(36);
        const seed = Math.random().toString(36).substring(2, 10);
        return `${type}-${currentTime}${seed}`;
    }

    private convertToMilliseconds(interval: number, unit: Unit): number {
        const units: Units = {
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            year: 365 * 24 * 60 * 60 * 1000,
            custom: 1000,
        };

        return interval * units[unit];
    }

    private getNextPaymentDate(
        replenishment: Replenishment,
        period: number
    ): string | undefined {
        let nextPaymentDate: Date | string | undefined =
            replenishment.lastPaymentDate
                ? new Date(
                      new Date(replenishment.lastPaymentDate).getTime() + period
                  )
                : undefined;

        nextPaymentDate =
            nextPaymentDate && nextPaymentDate <= new Date()
                ? new Date(Date.now() + period).toISOString()
                : nextPaymentDate?.toISOString();

        return nextPaymentDate;
    }

    public listen() {
        this.queue.on('error', (err) => {
            this.logger.error('Error from queue: ' + err);
        });

        this.queue.on('removed', (jobId) => {
            this.logger.log(`Job with id "${jobId}" has been removed!`);
        });
    }
}
