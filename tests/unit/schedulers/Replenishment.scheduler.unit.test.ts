import { redisClient } from '@/config/redis';
import { UserNotFoundError } from '@/errors';
import {
    Customer,
    Replenishment,
    ReplenishmentPayment,
} from '@/models/relational';
import { Scheduler } from '@/services/subscription_service/Scheduler';
import { ReplenishmentData, Status, Unit } from '@/types';
import { type Job, Queue } from 'bullmq';

class TestableReplenishmentScheduler extends Scheduler {
    public connection = redisClient;
    public override createQueue(queueName: string): Queue {
        return new Queue(queueName, {
            defaultJobOptions: {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
            connection: redisClient,
        });
    }
    public queue = this.createQueue('payments-queue');
}

describe('ReplenishmentScheduler', () => {
    const replenishmentScheduler = new TestableReplenishmentScheduler(
        'payments-queue'
    );

    const customerData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'john.doe',
        membership: 'free',
    };
    const replenishmentData: ReplenishmentData = {
        userId: 1,
        orderItems: [{ productId: 1, quantity: 10 }],
        paymentMethod: 'card',
        shippingCountry: 'germany',
        paymentMethodId: 'payment_method_id',
        currency: 'usd',
    };
    const mockReplenishmentData = {
        id: 1,
        schedulerId: '123',
        nextJobId: '123',
        customerId: 1,
        orderId: 1,
        startDate: '2023-01-01',
        lastPaymentDate: '2023-01-01',
        nextPaymentDate: '2023-01-01',
        unit: 'day' as Unit,
        interval: 2,
        endDate: '2023-01-01',
        times: 1,
        executions: 1,
        status: 'scheduled' as Status,
    };
    let mockCustomerInstance: Partial<Customer>;
    let mockReplenishmentInstance: Partial<Replenishment>;

    beforeEach(() => {
        mockCustomerInstance = {
            ...customerData,
            save: jest.fn(),
        } as unknown as Customer;
        mockReplenishmentInstance = {
            ...mockReplenishmentData,
            update: jest.fn(),
        };
        jest.spyOn(
            replenishmentScheduler.queue!,
            'upsertJobScheduler'
        ).mockResolvedValue({ id: '1' } as Job);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createReplenishment', () => {
        it('should throw UserNotFoundError if the customer does not exist', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                replenishmentScheduler.createReplenishment(
                    1,
                    replenishmentData,
                    2,
                    'day'
                )
            ).rejects.toThrow(UserNotFoundError);

            expect(Replenishment.create).not.toHaveBeenCalled();
        });

        it('should throw generic error if it fails to schedule job', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Replenishment.create as jest.Mock).mockResolvedValue(
                mockReplenishmentInstance
            );
            jest.spyOn(
                replenishmentScheduler.queue!,
                'upsertJobScheduler'
            ).mockResolvedValue(null as unknown as Job);

            await expect(
                replenishmentScheduler.createReplenishment(
                    1,
                    replenishmentData,
                    2,
                    'day'
                )
            ).rejects.toThrow('Failed to schedule job');

            expect(Replenishment.create).toHaveBeenCalled();
            expect(
                replenishmentScheduler.queue!.upsertJobScheduler
            ).toHaveBeenCalled();
            expect(redisClient.hset).not.toHaveBeenCalled();
        });

        it('should create a new replenishment', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Replenishment.create as jest.Mock).mockResolvedValue(
                mockReplenishmentInstance
            );

            await replenishmentScheduler.createReplenishment(
                1,
                replenishmentData,
                2,
                'day'
            );

            expect(Replenishment.create).toHaveBeenCalled();
            expect(
                replenishmentScheduler.queue!.upsertJobScheduler
            ).toHaveBeenCalled();
            expect(redisClient.hset).toHaveBeenCalled();
            expect(mockReplenishmentInstance.update).toHaveBeenCalled();
        });
    });

    describe('updateReplenishment', () => {
        it('should throw UserNotFoundError if the customer does not exist', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                replenishmentScheduler.updateReplenishment(
                    1,
                    1,
                    replenishmentData,
                    2,
                    'day'
                )
            ).rejects.toThrow(UserNotFoundError);

            expect(Replenishment.findByPk).not.toHaveBeenCalled();
        });

        it('should throw generic error if replenishment was not found', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Replenishment.findByPk as jest.Mock).mockResolvedValue(null);

            await expect(
                replenishmentScheduler.updateReplenishment(
                    1,
                    1,
                    replenishmentData,
                    2,
                    'day'
                )
            ).rejects.toThrow('Replenishment not found');

            expect(Replenishment.findByPk).toHaveBeenCalled();
            expect(
                replenishmentScheduler.queue!.upsertJobScheduler
            ).not.toHaveBeenCalled();
        });

        it('should throw generic error if replenishment cannot be updated', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Replenishment.findByPk as jest.Mock).mockResolvedValue({
                ...mockReplenishmentInstance,
                status: 'finished',
            });

            await expect(
                replenishmentScheduler.updateReplenishment(
                    1,
                    1,
                    replenishmentData,
                    2,
                    'day'
                )
            ).rejects.toThrow('"finished" replenishments cannot be updated');

            expect(Replenishment.findByPk).toHaveBeenCalled();
            expect(
                replenishmentScheduler.queue!.upsertJobScheduler
            ).not.toHaveBeenCalled();
        });

        it('should throw generic error if scheduled replenishment was not provided with a start date', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Replenishment.findByPk as jest.Mock).mockResolvedValue({
                ...mockReplenishmentInstance,
                status: 'scheduled',
            });

            await expect(
                replenishmentScheduler.updateReplenishment(
                    1,
                    1,
                    replenishmentData,
                    2,
                    'day'
                )
            ).rejects.toThrow(
                'Replenishment has a status of "scheduled". A starting date must be provided for updates.'
            );

            expect(Replenishment.findByPk).toHaveBeenCalled();
            expect(
                replenishmentScheduler.queue!.upsertJobScheduler
            ).not.toHaveBeenCalled();
        });

        it('should throw generic error if active replenishment was provided with a start date', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Replenishment.findByPk as jest.Mock).mockResolvedValue({
                ...mockReplenishmentInstance,
                status: 'active',
            });

            await expect(
                replenishmentScheduler.updateReplenishment(
                    1,
                    1,
                    replenishmentData,
                    2,
                    'day',
                    new Date().toISOString().split('T')[0]
                )
            ).rejects.toThrow(
                'A starting date is not allowed for active replenishment updates'
            );

            expect(Replenishment.findByPk).toHaveBeenCalled();
            expect(
                replenishmentScheduler.queue!.upsertJobScheduler
            ).not.toHaveBeenCalled();
        });

        it('should throw generic error if replenishment is canceled', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Replenishment.findByPk as jest.Mock).mockResolvedValue({
                ...mockReplenishmentInstance,
                status: 'canceled',
            });

            await expect(
                replenishmentScheduler.updateReplenishment(
                    1,
                    1,
                    replenishmentData,
                    2,
                    'day'
                )
            ).rejects.toThrow('A canceled replenishment cannot be updated');

            expect(Replenishment.findByPk).toHaveBeenCalled();
            expect(
                replenishmentScheduler.queue!.upsertJobScheduler
            ).not.toHaveBeenCalled();
        });

        it('should update replenishment and job', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Replenishment.findByPk as jest.Mock).mockResolvedValue({
                ...mockReplenishmentInstance,
                status: 'active',
                endDate: new Date().toISOString().split('T')[0],
                times: 4,
                lastPaymentDate: new Date().toISOString().split('T')[0],
            });
            (ReplenishmentPayment.count as jest.Mock).mockResolvedValue(5);

            await replenishmentScheduler.updateReplenishment(
                1,
                1,
                replenishmentData,
                2,
                'day'
            );

            expect(Replenishment.findByPk).toHaveBeenCalled();
            expect(ReplenishmentPayment.count).toHaveBeenCalled();
            expect(
                replenishmentScheduler.queue!.upsertJobScheduler
            ).toHaveBeenCalled();
            expect(redisClient.del).toHaveBeenCalled();
            expect(redisClient.hset).toHaveBeenCalled();
            expect(mockReplenishmentInstance.update).toHaveBeenCalled();
        });
    });
});

afterAll(async () => {
    if (redisClient.quit) await redisClient.quit();
});
