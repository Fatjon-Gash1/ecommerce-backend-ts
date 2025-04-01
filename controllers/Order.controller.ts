import { Request, Response } from 'express';
import { OrderService, LoggingService } from '@/services';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from '@/logger';
import {
    OrderAlreadyMarkedError,
    OrderNotFoundError,
    UserNotFoundError,
} from '@/errors';

export class OrderController {
    private orderService: OrderService;
    private loggingService?: LoggingService;
    private logger: Logger;

    constructor(
        orderService: OrderService,
        loggingService?: LoggingService
    ) {
        this.orderService = orderService;
        this.loggingService = loggingService;
        this.logger = new Logger();
    }

    public async getOrderById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        let userId: number | undefined;
        const { role } = req.user as JwtPayload;

        if (role === 'customer') {
            userId = Number((req.user as JwtPayload).userId);
        }

        const orderId: number = Number(req.params.id);

        try {
            const order = await this.orderService.getOrderById(userId, orderId);
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
        const { role } = req.user as JwtPayload;

        if (role === 'customer') {
            userId = Number((req.user as JwtPayload).userId);
        }

        const orderId: number = Number(req.params.id);

        try {
            const orderItems = await this.orderService.getOrderItemsByOrderId(
                userId,
                orderId
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

    public async getTotalPriceOfOrderItems(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const orderId: number = Number(req.params.id);

        try {
            const totalPrice =
                await this.orderService.getTotalPriceOfOrderItems(
                    userId,
                    orderId
                );
            return res.status(200).json({ totalPrice });
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                this.logger.error(
                    'Error getting total price of order items: ' + error
                );
                return res.status(404).json({ message: error.message });
            }

            this.logger.error(
                'Error getting total price of order items: ' + error
            );
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
                    status as string,
                    customerId,
                    userId
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
                await this.orderService.getCustomerOrderHistory(
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

    public async getAllOrders(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const { count, orders } = await this.orderService.getAllOrders();
            return res.status(200).json({ total: count, orders });
        } catch (error) {
            this.logger.error('Error getting all orders: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async cancelOrder(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const orderId: number = Number(req.params.id);

        try {
            await this.orderService.cancelOrder(userId, orderId);
            return res
                .status(200)
                .json({ message: 'Order canceled successfully' });
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                this.logger.error('Error cancelling order: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error cancelling order: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async markAsDelivered(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const orderId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;

        try {
            await this.orderService.markAsDelivered(orderId);
            res.sendStatus(204);

            await this.loggingService!.logOperation(username, 'order', 'update');
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                this.logger.error('Error marking order as delivered: ' + error);
                return res.status(404).json({ message: error.message });
            }

            if (error instanceof OrderAlreadyMarkedError) {
                this.logger.error('Error marking order as delivered: ' + error);
                return res.status(400).json({ message: error.message });
            }

            this.logger.error('Error marking order as delivered: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
