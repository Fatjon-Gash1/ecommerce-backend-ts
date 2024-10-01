import { Op } from 'sequelize';
import { Order, OrderItem, Customer } from '../models/relational';
import { UserNotFoundError } from '../errors/UserErrors';
import {
    OrderNotFoundError,
    OrderCreationError,
    OrderItemNotFoundError,
} from '../errors';

/**
 * Service responsible for Order-related operations.
 */
export class OrderService {
    /**
     * Creates an order for a customer.
     *
     * @param customerId - The ID of the customer
     * @param items - The items to add to the order
     * @param paymentMethod - The payment method for the order
     * @returns A promise resolving to the created order
     */
    public async createOrder(
        customerId: number,
        items: Map<number, number>,
        paymentMethod: string
    ): Promise<Order> {
        const customer = await Customer.findByPk(customerId);

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        if (!(items instanceof Map)) {
            throw new Error(
                'Items must be provided as a Map of productId to quantity.'
            );
        }

        if (items.size === 0) {
            throw new Error('Cannot create an order with no items.');
        }

        const order = await Order.create({
            customerId,
            paymentMethod,
        });

        if (!order) {
            throw new OrderCreationError();
        }

        await Promise.all(
            Array.from(items.entries()).map(async ([productId, quantity]) => {
                await order.addItem(productId, quantity);
            })
        );

        return order;
    }

    /**
     * Marks customer's order as delivered.
     *
     * @params orderId - The ID of the order
     */
    public async markAsDelivered(orderId: number): Promise<void> {
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        order.status = 'delivered';
        await order.save();
    }

    /**
     * Cancels a customer's order.
     *
     * @params orderId - The ID of the order
     */
    public async cancelOrder(orderId: number): Promise<void> {
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        order.status = 'cancelled';
        await order.save();
    }

    /**
     * Retrieves a specific order by ID.
     *
     * @param orderId - The ID of the order
     * @returns A promise resolving to the order
     */
    public async getOrderById(orderId: number): Promise<Order> {
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        return order;
    }

    /**
     * Retrieves all items of a specific order.
     *
     * @param orderId - The ID of the order
     * @returns A promise resolving to an array of OrderItem instances
     */
    public async getOrderItems(orderId: number): Promise<OrderItem[]> {
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        const orderItems = await order.getItems();

        if (orderItems.length === 0) {
            throw new OrderItemNotFoundError();
        }

        return orderItems;
    }

    /**
     * Calculates the total price of all items in a specific order.
     *
     * @param orderId - The ID of the order
     * @returns A promise resolving to the total price
     */
    public async getTotalPriceOfOrderItems(orderId: number): Promise<number> {
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        const totalPrice = await order.getTotalPrice();

        if (!totalPrice) {
            throw new OrderItemNotFoundError();
        }

        return totalPrice;
    }

    /**
     * Retrieves all finished orders for a customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise resolving to an array of Order instances
     */
    public async getdeliveredOrders(customerId: number): Promise<Order[]> {
        const orders = await Order.findAll({
            where: { customerId, status: 'delivered' },
        });

        if (orders.length === 0) {
            throw new OrderNotFoundError('No delivered orders found');
        }

        return orders;
    }

    /**
     * Retrieves all pending orders for a customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise resolving to an array of Order instances
     */
    public async getPendingOrders(customerId: number): Promise<Order[]> {
        const orders = await Order.findAll({
            where: { customerId, status: 'pending' },
        });

        if (orders.length === 0) {
            throw new OrderNotFoundError('No pending orders found');
        }

        return orders;
    }

    /**
     * Retrieves all cancelled orders for a customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise resolving to an array of Order instances
     */
    public async getCancelledOrders(customerId: number): Promise<Order[]> {
        const orders = await Order.findAll({
            where: { customerId, status: 'cancelled' },
        });

        if (orders.length === 0) {
            throw new OrderNotFoundError('No cancelled orders found');
        }

        return orders;
    }

    /**
     * Retrieves customer's order history.
     *
     * @param customerId - The ID of the customer
     * @returns A promise resolving to an array of Order instances
     */
    public async getOrderHistory(customerId: number): Promise<Order[]> {
        const orders = await Order.findAll({
            where: { customerId, status: { [Op.not]: 'pending' } },
        });

        if (!orders) {
            throw new OrderNotFoundError('No orders found in the history');
        }

        return orders;
    }
}

export default new OrderService();
