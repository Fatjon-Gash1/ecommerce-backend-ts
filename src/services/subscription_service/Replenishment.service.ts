import { Scheduler } from './Scheduler';
import { WorkerService } from './Worker.service';
import {
    Customer,
    Replenishment,
    ReplenishmentPayment,
} from '@/models/relational';
import { UserNotFoundError } from '@/errors';
import {
    ReplenishmentResponse,
    ReplenishmentFilters,
    Unit,
    Status,
} from '@/types';

/**
 * Responsible for replenishment related operations
 *
 * @remarks
 * Uses two separate classes.
 *
 * @Scheduler - Handles scheduling of replenishments
 * @WorkerService - Handles processing of replenishments
 */
export class ReplenishmentService {
    private queueName = 'payments-queue';
    public scheduler?: Scheduler;
    private workerService?: WorkerService;

    constructor(instantiation?: 'partial') {
        if (!instantiation) {
            this.scheduler = new Scheduler(this.queueName);
            this.workerService = new WorkerService(this.queueName);
        }
    }

    public listenAll(): void {
        this.scheduler!.listen();
        this.workerService!.listen();
    }

    public getScheduler(): Scheduler | null {
        return this.scheduler ?? null;
    }

    public getWorkerService(): WorkerService | null {
        return this.workerService ?? null;
    }

    /**
     * Retrieves all replenishments for a customer
     *
     * @param userId - The user id of the customer
     * @returns A promise resolving to an object containing the total number of replenishments and an array of replenishments
     */
    public async getCustomerReplenishments(
        userId: number
    ): Promise<{ total: number; rows: ReplenishmentResponse[] }> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const { rows, count } = await Replenishment.findAndCountAll({
            where: { customerId: customer.id },
            attributes: {
                exclude: [
                    'schedulerId',
                    'nextJobId',
                    'createdAt',
                    'updatedAt',
                    'deletedAt',
                    'customerId',
                ],
            },
            include: {
                model: ReplenishmentPayment,
                as: 'payments',
                attributes: ['paymentDate'],
            },
            distinct: true,
        });

        return { total: count, rows: rows.map((row) => row.toJSON()) };
    }

    /**
     * Retrieves a specific replenishment by its ID for a customer
     *
     * @param userId - The user id of the customer
     * @param replenishmentId - The ID of the replenishment to retrieve
     * @returns A promise resolving to the replenishment object
     */
    public async getReplenishmentById(
        userId: number,
        replenishmentId: number
    ): Promise<ReplenishmentResponse> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const replenishment = await Replenishment.findOne({
            where: { id: replenishmentId, customerId: customer.id },
            attributes: {
                exclude: [
                    'schedulerId',
                    'nextJobId',
                    'createdAt',
                    'updatedAt',
                    'deletedAt',
                    'customerId',
                ],
            },
            include: {
                model: ReplenishmentPayment,
                as: 'payments',
                attributes: ['paymentDate'],
            },
        });

        if (!replenishment) {
            throw new Error('Replenishment not found');
        }

        return replenishment.toJSON();
    }

    /**
     * Retrieves all customer order replenishments based on filtered parameters. If none provided it returns all replenishments.
     *
     * @param [filters] - Optional filters to filter replenishments
     * @returns A promise resolving to an object containing the total number of replenishments and an array of replenishments
     */
    public async getAllReplenishments(
        filters?: ReplenishmentFilters
    ): Promise<{ total: number; replenishments: ReplenishmentResponse[] }> {
        const preparedFilters: Record<string, number | Unit | Status> = {};

        if (filters) {
            for (const key in filters) {
                const typedKey = key as keyof ReplenishmentFilters;
                const value = filters[typedKey];

                if (value !== undefined) {
                    preparedFilters[typedKey] = value;
                }
            }
        }

        const { rows, count } = await Replenishment.findAndCountAll({
            where: preparedFilters,
            attributes: {
                exclude: [
                    'schedulerId',
                    'nextJobId',
                    'createdAt',
                    'updatedAt',
                    'deletedAt',
                    'customerId',
                ],
            },
            include: {
                model: ReplenishmentPayment,
                as: 'payments',
                attributes: ['paymentDate'],
            },
            distinct: true,
        });

        return {
            total: count,
            replenishments: rows.map((row) => row.toJSON()),
        };
    }
}
