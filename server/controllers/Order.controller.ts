import { Request, Response } from 'express';
import { OrderService, AdminLogsService } from '../services';
import { JwtPayload } from 'jsonwebtoken';
import {
    InvalidOrderStatusError,
    OrderNotFoundError,
    ProductNotFoundError,
    UserNotFoundError,
} from '../errors';

export class OrderController {
    private orderService: OrderService;
    private adminLogsService: AdminLogsService | null;

    constructor(
        orderService: OrderService,
        adminLogsService: AdminLogsService | null = null
    ) {
        this.orderService = orderService;
        this.adminLogsService = adminLogsService;
    }

    public async createOrder(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const { items, paymentMethod } = req.body;

        try {
            const order = await this.orderService.createOrder(
                userId,
                items,
                paymentMethod
            );
            return res.status(201).json({
                message: 'Order created successfully',
                order,
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error creating order: ', error);
                return res.status(404).json({ message: error.message });
            }
            if (error instanceof ProductNotFoundError) {
                console.error('Error creating order: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error creating order: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getOrderById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const orderId: number = Number(req.params.id);

        try {
            const order = await this.orderService.getOrderById(orderId);
            return res.status(200).json({ order });
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                console.error('Error getting order: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error getting order: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getOrderItemsByOrderId(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const orderId: number = Number(req.params.id);

        try {
            const orderItems =
                await this.orderService.getOrderItemsByOrderId(orderId);
            return res.status(200).json({ orderItems });
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                console.error('Error getting order items: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error getting order items: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalPriceOfOrderItems(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const orderId: number = Number(req.params.id);

        try {
            const totalPrice =
                await this.orderService.getTotalPriceOfOrderItems(orderId);
            return res.status(200).json({ totalPrice });
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                console.error(
                    'Error getting total price of order items: ',
                    error
                );
                return res.status(404).json({ message: error.message });
            }

            console.error('Error getting total price of order items: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getOrdersByStatus(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        let userId: number;

        if (req.params.id) {
            userId = Number(req.params.userId);
        } else {
            userId = Number((req.user as JwtPayload).userId);
        }

        const status: string = req.query.status as string;

        try {
            const orders = await this.orderService.getOrdersByStatus(
                userId,
                status
            );
            return res.status(200).json({ orders });
        } catch (error) {
            if (error instanceof InvalidOrderStatusError) {
                console.error('Error getting user orders by status: ', error);
                return res.status(400).json({ message: error.message });
            }
            if (error instanceof UserNotFoundError) {
                console.error('Error getting user orders by status: ', error);
                return res.status(404).json({ message: error.message });
            }
            console.error('Error getting user orders by status: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getOrderHistory(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        let userId: number;

        if (req.params.id) {
            userId = Number(req.params.userId);
        } else {
            userId = Number((req.user as JwtPayload).userId);
        }

        try {
            const orders = await this.orderService.getOrderHistory(userId);
            return res.status(200).json({ orders });
        } catch (error) {
            console.error('Error getting order history: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllOrders(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const orders = await this.orderService.getAllOrders();
            return res.status(200).json({ orders });
        } catch (error) {
            console.error('Error getting all orders: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async cancelOrder(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const orderId: number = Number(req.params.id);

        try {
            await this.orderService.cancelOrder(orderId);
            return res
                .status(200)
                .json({ message: 'Order canceled successfully' });
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                console.error('Error cancelling order: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error cancelling order: ', error);
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

            this.adminLogsService!.log(username, 'order', 'update');
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                console.error('Error marking order as delivered: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error marking order as delivered: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
