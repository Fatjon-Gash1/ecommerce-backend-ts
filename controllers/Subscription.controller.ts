import { Request, Response } from 'express';
import {
    SubscriptionService,
    ReplenishmentService,
    LoggingService,
} from '@/services';
import { Logger } from '@/logger';
import { JwtPayload } from 'jsonwebtoken';
import { UserNotFoundError } from '@/errors';

export class SubscriptionController {
    private subscriptionService: SubscriptionService;
    private replenishmentService?: ReplenishmentService;
    private loggingService?: LoggingService;
    private logger: Logger;

    constructor(
        subscriptionService: SubscriptionService,
        replenishmentService?: ReplenishmentService,
        loggingService?: LoggingService
    ) {
        this.subscriptionService = subscriptionService;
        this.replenishmentService = replenishmentService;
        this.loggingService = loggingService;
        this.logger = new Logger();
    }

    public async createMembershipSubscription(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const { type, annual } = req.query;
        const { promoCode } = req.body;

        try {
            await this.subscriptionService.createMembershipSubscription(
                userId,
                type as 'plus' | 'premium',
                annual as boolean | undefined,
                promoCode
            );

            return res.status(201).json({
                message: 'Membership subscription created successfully',
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error(
                    'Error creating membership subscription: ' + error
                );
                return res.status(404).json({ message: error.message });
            }
            this.logger.error(
                'Error creating membership subscription: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async subscribeToNewMembershipPrice(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const { type, plan, ['time-left']: endOfPeriod } = req.query;

        try {
            await this.subscriptionService.subscribeToNewMembershipPrice(
                userId,
                type as 'plus' | 'premium',
                plan as 'annual' | 'monthly',
                Number(endOfPeriod)
            );

            return res.status(201).json({
                message: 'Successfully subscribed to new membership price',
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error(
                    'Error subscribing to new membership price: ' + error
                );
                return res.status(404).json({ message: error.message });
            }
            this.logger.error(
                'Error subscribing to new membership price: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async cancelMembershipSubscription(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const { immediate } = req.query;

        try {
            await this.subscriptionService.cancelMembershipSubscription(
                userId,
                immediate as boolean | undefined
            );
            return res
                .status(200)
                .json({ message: 'Membership subscription canceled' });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error(
                    'Error canceling membership subscription: ' + error
                );
                return res.status(404).json({ message: error.message });
            }
            this.logger.error(
                'Error canceling membership subscription: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async changeMembershipPrice(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { username } = req.user as JwtPayload;
        const membershipId = req.params.id;
        const pricePlan = req.query.plan as 'annual' | 'monthly';
        const { price } = req.body;

        try {
            await this.subscriptionService.changeMembershipPrice(
                membershipId,
                pricePlan,
                price
            );
            res.status(200).json({
                message: 'Membership price changed successfully',
            });
            await this.loggingService!.logOperation(username, 'membership', 'update');
        } catch (error) {
            this.logger.error('Error changing membership price: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getMemberships(
        _req: Request,
        res: Response
    ): Promise<Response | void> {
        try {
            const memberships = await this.subscriptionService.getMemberships();
            return res.status(200).json({ memberships });
        } catch (error) {
            this.logger.error('Error retrieving memberships: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getMembershipSubscriptions(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { type, plan, status } = req.query;

        try {
            const { total, subscriptions } =
                await this.subscriptionService.getMembershipSubscriptions({
                    type: type as 'free' | 'plus' | 'premium',
                    plan: plan as 'annual' | 'monthly',
                    status: status as 'active' | 'canceled',
                });
            return res.status(200).json({ total, subscriptions });
        } catch (error) {
            this.logger.error(
                'Error retrieving membership subscriptions: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async createReplenishment(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const { data, interval, unit, starting, expiry, times } = req.body;

        try {
            await this.replenishmentService!.scheduler!.createReplenishment(
                userId,
                data,
                interval,
                unit,
                starting,
                expiry,
                times
            );

            return res
                .status(201)
                .json({ message: 'Created a new replenishment' });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error creating replenishment: ' + error);
                return res.status(404).json({ message: error.message });
            }
            this.logger.error('Error creating replenishment: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getReplenishmentById(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const replenishmentId = Number(req.params.id);

        try {
            const replenishment =
                await this.replenishmentService!.getReplenishmentById(
                    userId,
                    replenishmentId
                );
            return res.status(200).json({ replenishment });
        } catch (error) {
            this.logger.error(
                'Error retrieving customer replenishment: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerReplenishments(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;

        try {
            const { total, rows } =
                await this.replenishmentService!.getCustomerReplenishments(
                    userId
                );
            return res.status(200).json({ total, replenishments: rows });
        } catch (error) {
            this.logger.error(
                'Error retrieving customer replenishments: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllReplenishments(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { customerId, unit, interval, status } = req.query;

        try {
            const { total, replenishments } =
                await this.replenishmentService!.getAllReplenishments({
                    customerId: Number(customerId),
                    unit: unit as 'day' | 'week' | 'month' | 'year' | 'custom',
                    interval: Number(interval),
                    status: status as
                        | 'scheduled'
                        | 'active'
                        | 'finished'
                        | 'canceled'
                        | 'failed',
                });
            return res.status(200).json({ total, replenishments });
        } catch (error) {
            this.logger.error(
                'Error retrieving replenishment subscriptions: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateReplenishment(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const replenishmentId = Number(req.params.id);
        const { data, interval, unit, starting, expiry, times } = req.body;

        try {
            await this.replenishmentService!.scheduler!.updateReplenishment(
                userId,
                replenishmentId,
                data,
                interval,
                unit,
                starting,
                expiry,
                times
            );

            return res.status(200).json({ message: 'Updated replenishment' });
        } catch (error) {
            this.logger.error('Error updating replenishment: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async toggleCancelStatusOnReplenishment(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const replenishmentId = Number(req.params.id);

        try {
            await this.replenishmentService!.scheduler!.toggleCancelStatusOnReplenishment(
                userId,
                replenishmentId
            );
            return res.sendStatus(204);
        } catch (error) {
            this.logger.error('Error canceling replenishment: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async removeReplenishment(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const replenishmentId = Number(req.params.id);

        try {
            await this.replenishmentService!.scheduler!.removeReplenishment(
                userId,
                replenishmentId
            );
            return res.sendStatus(204);
        } catch (error) {
            this.logger.error('Error removing replenishment: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
