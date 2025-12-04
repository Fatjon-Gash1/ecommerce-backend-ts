import { Request, Response } from 'express';
import { AdminService, OrderService, PaymentService } from '@/services';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from '@/logger';
import { UserNotFoundError, OrderNotFoundError } from '@/errors';

export class SupportAgentController {
    private paymentService: PaymentService;
    private orderService: OrderService;
    private adminService: AdminService;
    private logger: Logger;

    constructor(
        paymentService: PaymentService,
        orderService: OrderService,
        adminService: AdminService
    ) {
        this.paymentService = paymentService;
        this.orderService = orderService;
        this.adminService = adminService;
        this.logger = new Logger();
    }

    public async getProfile(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;

        try {
            const supportAgent =
                await this.adminService.getSupportAgentById(userId);
            return res.status(200).json({ supportAgent });
        } catch (error) {
            this.logger.error('Error retrieving support agent by Id: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async handleRefundRequest(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const refundRequestId = Number(req.params.id);
        const { action, rejectionReason } = req.body;

        try {
            await this.paymentService.handleRefundRequest(
                refundRequestId,
                action,
                rejectionReason
            );
            return res.sendStatus(200);
        } catch (error) {
            this.logger.error('Error handling refund requests: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getRefundRequests(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { customerId, status } = req.query;

        try {
            const { total, requests } =
                await this.paymentService.getRefundRequests({
                    customerId: customerId ? Number(customerId) : undefined,
                    status: status as 'pending' | 'approved' | 'denied',
                });
            return res.status(200).json({ total, requests });
        } catch (error) {
            this.logger.error('Error retrieving refund requests: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerRefundRequests(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;

        try {
            const refundRequests =
                await this.paymentService.getCustomerRefundRequests(userId);
            return res.status(200).json({ refundRequests });
        } catch (error) {
            this.logger.error(
                'Error retrieving customer refund requests: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerProfile(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;

        try {
            const customer = await this.adminService.getCustomerById(userId);
            return res.status(200).json({ customer });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error retrieving customer by ID: ' + error);
                return res.status(404).json({ message: 'Customer not found' });
            }

            this.logger.error('Error retrieving customer by ID: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerOrdersByStatus(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        let customerId: number | undefined;
        let userId: number | undefined;

        if (req.params.customerId) {
            customerId = Number(req.params.customerId);
        } else {
            userId = Number((req.user as JwtPayload).userId);
        }

        const { status } = req.query;

        try {
            const { count, orders } =
                await this.orderService.getCustomerOrdersByStatus(
                    customerId,
                    userId,
                    status as string
                );
            return res.status(200).json({ total: count, orders });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error(
                    'Error getting user orders by status: ' + error
                );
                return res.status(404).json({ message: error.message });
            }
            this.logger.error('Error getting user orders by status: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerOrderHistory(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        let customerId: number | undefined;
        let userId: number | undefined;

        if (req.params.customerId) {
            customerId = Number(req.params.customerId);
        } else {
            userId = Number((req.user as JwtPayload).userId);
        }

        try {
            const { count, orders } =
                await this.orderService.getCustomerOrdersByStatus(
                    customerId,
                    userId
                );
            return res.status(200).json({ total: count, orders });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error getting order history: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting order history: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getOrderById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        let userId: number | undefined;
        const { type } = req.user as JwtPayload;

        if (type === 'customer') {
            userId = Number((req.user as JwtPayload).userId);
        }

        const orderId: number = Number(req.params.id);

        try {
            const order = await this.orderService.getOrderById(orderId, userId);
            return res.status(200).json({ order });
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                this.logger.error('Error getting order: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting order: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getOrderItemsByOrderId(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        let userId: number | undefined;
        const { type } = req.user as JwtPayload;

        if (type === 'customer') {
            userId = Number((req.user as JwtPayload).userId);
        }

        const orderId: number = Number(req.params.id);

        try {
            const orderItems = await this.orderService.getOrderItemsByOrderId(
                orderId,
                userId
            );
            return res.status(200).json({ orderItems });
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                this.logger.error('Error getting order items: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting order items: ' + error);
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
}
