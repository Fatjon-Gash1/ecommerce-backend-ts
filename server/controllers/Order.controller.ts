import { Request, Response } from 'express';
import { OrderService, AdminLogsService } from '../services';
import { OrderNotFoundError, UserNotFoundError } from '../errors';

export class OrderController {
    private orderService: OrderService;
    private adminLogsService: AdminLogsService;

    constructor(
        orderService: OrderService,
        adminLogsService: AdminLogsService
    ) {
        this.orderService = orderService;
        this.adminLogsService = adminLogsService;
    }

    public async createOrder(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId: number = Number(req.params.id);
        const { items, paymentMethod } = req.body;

        try {
            const order = await this.orderService.createOrder(
                customerId,
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

            console.error('Error creating order: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async markAsDelivered(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const orderId: number = Number(req.params.id);
        const { username } = req.body;

        try {
            await this.orderService.markAsDelivered(orderId);
            res.sendStatus(204);

            this.adminLogsService.log(username, 'order', 'update');
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                console.error('Error marking order as delivered: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error marking order as delivered: ', error);
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
            return res.sendStatus(204);
        } catch (error) {
            if (error instanceof OrderNotFoundError) {
                console.error('Error cancelling order: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error cancelling order: ', error);
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

    public async getOrderItems(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const orderId: number = Number(req.params.id);

        try {
            const orderItems = await this.orderService.getOrderItems(orderId);
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

    public async getDeliveredOrders(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId: number = Number(req.params.id);

        try {
            const orders =
                await this.orderService.getDeliveredOrders(customerId);
            return res.status(200).json({ orders });
        } catch (error) {
            console.error('Error getting delivered orders: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPendingOrders(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId: number = Number(req.params.id);

        try {
            const orders = await this.orderService.getPendingOrders(customerId);
            return res.status(200).json({ orders });
        } catch (error) {
            console.error('Error getting pending orders: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCancelledOrders(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId: number = Number(req.params.id);

        try {
            const orders =
                await this.orderService.getCancelledOrders(customerId);
            return res.status(200).json({ orders });
        } catch (error) {
            console.error('Error getting cancelled orders: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getOrderHistory(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId: number = Number(req.params.id);

        try {
            const orders = await this.orderService.getOrderHistory(customerId);
            return res.status(200).json({ orders });
        } catch (error) {
            console.error('Error getting order history: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
