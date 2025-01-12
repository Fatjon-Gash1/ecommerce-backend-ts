import { Request, Response } from 'express';
import { SubscriptionService, AdminLogsService } from '../services';
import { JwtPayload } from 'jsonwebtoken';

export class SubscriptionController {
    private subscriptionService: SubscriptionService;
    private adminLogsService?: AdminLogsService;

    constructor(
        subscriptionService: SubscriptionService,
        adminLogsService?: AdminLogsService
    ) {
        this.subscriptionService = subscriptionService;
        this.adminLogsService = adminLogsService;
    }

    public async getMemberships(
        _req: Request,
        res: Response
    ): Promise<Response | void> {
        try {
            const memberships = await this.subscriptionService.getMemberships();
            return res.status(200).json({ memberships });
        } catch (error) {
            console.error('Error retrieving memberships: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateMembershipById(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { username } = req.user as JwtPayload;
        const membershipId: string = req.params.id;
        const { name, monthlyPrice, annualPrice, currency, otherDetails } =
            req.body;

        try {
            const membership =
                await this.subscriptionService.updateMembershipById(
                    membershipId,
                    name,
                    monthlyPrice,
                    annualPrice,
                    currency,
                    otherDetails
                );

            res.status(200).json({ membership });

            await this.adminLogsService!.log(username, 'membership', 'update');
        } catch (error) {
            console.error('Error retrieving membership: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
