import { Request, Response } from 'express';
import { AdminService, LoggingService, OrderService } from '@/services';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from '@/logger';
import { OrderNotFoundError } from '@/errors';

export class CourierController {
    private orderService: OrderService;
    private adminService: AdminService;
    private loggingService: LoggingService;
    private logger: Logger;

    constructor(
        orderService: OrderService,
        adminService: AdminService,
        loggingService: LoggingService
    ) {
        this.orderService = orderService;
        this.adminService = adminService;
        this.loggingService = loggingService;
        this.logger = new Logger();
    }

    public async getProfile(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;

        try {
            const courier = await this.adminService.getCourierById(userId);
            return res.status(200).json({ courier });
        } catch (error) {
            this.logger.error('Error retrieving courier profile: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getOrdersByStatus(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { status } = req.query;

        try {
            const { count, orders } = await this.orderService.getOrdersByStatus(
                status as string
            );
            return res.status(200).json({ total: count, orders });
        } catch (error) {
            this.logger.error('Error getting orders by status: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllManagers(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const { count, admins } =
                await this.adminService.getAllAdmins('manager');
            return res.status(200).json({ total: count, managers: admins });
        } catch (error) {
            this.logger.error('Error retrieving managers: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async markOrder(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username, userId } = req.user as JwtPayload;
        const orderId = Number(req.params.id);
        const { status } = req.body;

        try {
            await this.orderService.markOrder(userId, orderId, status);

            res.sendStatus(204);

            await this.loggingService!.logOperation(
                username,
                'order',
                'update'
            );
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                this.logger.error('Error marking order: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error marking order: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
