import { Queue } from 'bullmq';
import { connectToRedisServer } from '../../config/redis';
import type IORedis from 'ioredis';

interface OrderData {
    userId: number;
    orderItems: OrderItem[];
    paymentMethod: 'card' | 'wallet' | 'bank-transfer';
    shippingCountry: string;
}

interface OrderItem {
    productId: number;
    quantity: number;
}

interface ReplenishmentData extends OrderData {
    paymentMethodId: string;
    currency: 'usd' | 'eur';
}

interface Units {
    day: number;
    week: number;
    month: number;
    year: number;
    custom: number;
}

type Unit = 'day' | 'week' | 'month' | 'year' | 'custom';

export class Scheduler {
    private connection: IORedis;
    private queue: Queue; // A queue for scheduled recurring payments

    constructor(queueName: string) {
        this.connection = connectToRedisServer();
        this.queue = this.createQueue(queueName);
    }

    private createQueue(queueName: string): Queue {
        return new Queue(queueName, {
            /*   defaultJobOptions: {
                attempts: 5, // 2^(1->2->3->4->*5(-1)) * 5000 | executions: 10000ms, 10000ms, 20000ms, 40000ms, 80000ms
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },*/
            connection: this.connection,
        });
    }

    public async scheduleReplenishment(
        data: ReplenishmentData,
        interval: number,
        unit: Unit,
        trial?: Date,
        expiry?: Date,
        times?: number
    ): Promise<void> {
        const milliseconds = this.convertToMilliseconds(interval, unit);
        const startDate = new Date().toISOString().split('T')[0];

        await this.queue.upsertJobScheduler(
            this.generateId('scheduler'),
            {
                every: milliseconds,
                startDate: trial,
                endDate: expiry,
                limit: times,
            },
            {
                name: this.generateId('job'),
                data: {
                    ...data,
                    startDate: trial ?? startDate,
                    endDate: expiry,
                    period: milliseconds,
                },
                opts: {
                    removeOnComplete: true,
                    removeOnFail: { age: 24 * 3600 },
                },
            }
        );

        console.log(`Scheduled job`);
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

    public listen() {
        this.queue.on('error', (err) => {
            console.error('Error from queue: ', err);
        });

        this.queue.on('removed', (job) => {
            console.log(`Job with id "${job.id}" has been removed!`);
        });
    }
}
