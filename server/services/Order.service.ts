import { Op } from 'sequelize';
import { Order, OrderItem, Customer } from '../models/relational';
import { UserNotFoundError } from '../errors/UserErrors';
import { OrderNotFoundError } from '../errors';

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
        items: { [key: number]: number },
        paymentMethod: string
    ): Promise<Order> {
        const itemsMap = new Map<number, number>(
            Object.entries(items).map(([productId, quantity]) => [
                Number(productId),
                Number(quantity),
            ])
        );

        const customer = await Customer.findByPk(customerId);

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        const order = await Order.create({
            customerId,
            paymentMethod,
        });

        await Promise.all(
            Array.from(itemsMap.entries()).map(
                async ([productId, quantity]) => {
                    await order.addItem(productId, quantity);
                }
            )
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

        return await order.getTotalPrice();
    }

    /**
     * Retrieves all finished orders for a customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise resolving to an array of Order instances
     */
    public async getDeliveredOrders(customerId: number): Promise<Order[]> {
        const orders = await Order.findAll({
            where: { customerId, status: 'delivered' },
        });

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

        return orders;
    }
}
