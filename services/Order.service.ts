import { sequelize } from '@/config/db';
import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';
import { Order, Customer } from '@/models/relational';
import {
    UserNotFoundError,
    OrderNotFoundError,
    OrderAlreadyMarkedError,
} from '@/errors';

interface OrderItemAttributes {
    productId: number;
    quantity: number;
}

interface OrderResponse {
    id: number;
    customerId: number;
    paymentMethod: 'card' | 'wallet' | 'bank-transfer';
    shippingCountry: string;
    shippingWeight: 'light' | 'standard' | 'heavy';
    shippingMethod: 'standard' | 'express' | 'next-day';
    status:
        | 'pending'
        | 'shipped'
        | 'awaiting pickup'
        | 'delivered'
        | 'canceled'
        | 'refunded'
        | 'partially-refunded';
    trackingNumber: string;
    total: number;
    createdAt?: Date;
}

interface OrderItemResponse {
    id?: number;
    name: string;
    description: string;
    imageUrl: string;
    weight: number;
    price: number;
    quantity?: number;
}

/**
 * Service responsible for Order-related operations.
 */
export class OrderService {
    /**
     * Creates an order for a customer.
     *
     * @param userId - The user id
     * @param items - The items to add to the order
     * @param paymentMethod - The payment method for the order
     * @param shippingCountry - The shipping country for the order
     * @param shippingWeight - The shipping weight for the order
     * @param shippingMethod - The shipping method for the order
     * @param orderTotal - The total price of the order
     * @param paymentIntentId - The id of the payment intent which is used for refunds
     * @param [transactionObj] - An existing transaction
     * @returns A promise resolving to the created order
     */
    public async createOrder(
        userId: number,
        items: OrderItemAttributes[],
        paymentMethod: 'card',
        shippingCountry: string,
        shippingWeight: 'standard' | 'light' | 'heavy',
        shippingMethod: 'standard' | 'express' | 'next-day',
        orderTotal: number,
        paymentIntentId: string,
        transactionObj?: Transaction
    ): Promise<OrderResponse> {
        const transaction: Transaction =
            transactionObj ?? (await sequelize.transaction());

        try {
            const customer = await Customer.findOne({
                where: { userId },
                transaction,
            });

            if (!customer) {
                throw new UserNotFoundError('Customer not found');
            }

            const order = await Order.create(
                {
                    customerId: customer.id,
                    paymentMethod,
                    shippingCountry,
                    shippingWeight,
                    shippingMethod,
                    total: orderTotal,
                    paymentIntentId,
                },
                { transaction }
            );

            await Promise.all(
                items.map(async ({ productId, quantity }) => {
                    await order.addItem(productId, quantity, transaction);
                })
            );

            if (!transactionObj) {
                await transaction.commit();
            }

            return order.toJSON();
        } catch (error) {
            if (!transactionObj) {
                await transaction.rollback();
            }

            throw error;
        }
    }

    /**
     * Retrieves a specific order by ID.
     *
     * @param userId - The id of the user
     * @param orderId - The ID of the order
     * @returns A promise resolving to the order
     */
    public async getOrderById(
        userId: number | undefined,
        orderId: number
    ): Promise<OrderResponse> {
        let order: Order | null;

        if (userId) {
            order = await Order.findOne({
                where: { id: orderId },
                attributes: { exclude: ['updatedAt', 'customerId'] },
                include: {
                    model: Customer,
                    attributes: [],
                    where: { userId },
                    required: true,
                },
            });
        } else {
            order = await Order.findByPk(orderId, {
                attributes: { exclude: ['updatedAt', 'customerId'] },
            });
        }

        if (!order) {
            throw new OrderNotFoundError();
        }

        return order.toJSON();
    }

    /**
     * Retrieves all items of a specific order.
     *
     * @param userId - The id of the user
     * @param orderId - The ID of the order
     * @returns A promise resolving to an array of OrderItem instances
     *
     * @throws {@link OrderNotFoundError}
     * Thrown if the order is not found.
     */
    public async getOrderItemsByOrderId(
        userId: number | undefined,
        orderId: number
    ): Promise<OrderItemResponse[]> {
        let order: Order | null;

        if (userId) {
            order = await Order.findOne({
                where: { id: orderId },
                include: {
                    model: Customer,
                    attributes: [],
                    where: { userId },
                    required: true,
                },
            });
        } else {
            order = await Order.findByPk(orderId);
        }

        if (!order) {
            throw new OrderNotFoundError();
        }

        const orderItems = await order.getProducts({
            attributes: [
                'id',
                'name',
                'description',
                'imageUrl',
                'weight',
                'price',
                'discount',
            ],
            joinTableAttributes: ['quantity'],
        });

        return orderItems.map((item) => {
            const product = item.toJSON();
            product.quantity = product.OrderItem!.quantity;
            delete product.OrderItem;
            return product;
        });
    }

    /**
     * Calculates the total price of all items in a specific order.
     *
     * @param userId - The id of the user
     * @param orderId - The id of the order
     * @returns A promise resolving to the total price
     */
    public async getTotalPriceOfOrderItems(
        userId: number,
        orderId: number
    ): Promise<number> {
        const order = await Order.findOne({
            where: { id: orderId },
            include: {
                model: Customer,
                attributes: [],
                where: { userId },
                required: true,
            },
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        return await order.getTotalPrice();
    }

    /**
     * Retrieves all platform orders by a given status.
     *
     * @param status - The status of the order
     * @returns A promise resolving to an array of Order instances and their count
     */
    public async getOrdersByStatus(
        status: string
    ): Promise<{ count: number; orders: OrderResponse[] }> {
        const { count, rows } = await Order.findAndCountAll({
            where: { status },
        });

        const orders = rows.map((order) => order.toJSON());

        return { count, orders };
    }

    /**
     * Retrieves all orders by a given status for a customer.
     *
     * @remarks
     * The order history is retrieved for a customer either by their id
     * or their implicit id.
     *
     * @param userId - The id of the user "Implicit customer id"
     * @param customerId - The id of the customer
     * @param status - The status of the order
     * @returns A promise resolving to an array of Order instances
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user of type Customer is not found.
     */
    public async getCustomerOrdersByStatus(
        status: string,
        customerId: number | undefined,
        userId: number | undefined
    ): Promise<{ count: number; orders: OrderResponse[] }> {
        let customer: Customer | null | undefined;

        if (customerId) {
            customer = await Customer.findByPk(customerId);
        } else if (userId) {
            customer = await Customer.findOne({ where: { userId } });
        }

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const { count, rows } = await Order.findAndCountAll({
            where: { customerId: customer.id, status },
            attributes: { exclude: ['updatedAt', 'customerId'] },
        });

        const orders = rows.map((row) => row.toJSON());

        return { count, orders };
    }

    /**
     * Retrieves customer's order history.
     *
     * @remarks
     * The order history is retrieved for a customer either by their id
     * or their implicit id.
     *
     * @param customerId - The customer id
     * @param userId - The id of the user "Implicit customer id"
     * @returns A promise resolving to an array of Order instances
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user of type Customer is not found.
     */
    public async getCustomerOrderHistory(
        customerId: number | undefined,
        userId: number | undefined
    ): Promise<{ count: number; orders: OrderResponse[] }> {
        let customer: Customer | null | undefined;

        if (customerId) {
            customer = await Customer.findByPk(customerId);
        } else if (userId) {
            customer = await Customer.findOne({ where: { userId } });
        }

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const { count, rows } = await Order.findAndCountAll({
            where: { customerId: customer.id, status: { [Op.not]: 'pending' } },
            attributes: { exclude: ['updatedAt', 'customerId'] },
        });

        const orders = rows.map((row) => row.toJSON());

        return { count, orders };
    }

    /**
     * Retrieves all orders in the database.
     *
     * @returns A promise resolving to an array of Order instances
     */
    public async getAllOrders(): Promise<{
        count: number;
        orders: OrderResponse[];
    }> {
        const { count, rows } = await Order.findAndCountAll({
            attributes: { exclude: ['updatedAt', 'customerId'] },
        });

        const orders = rows.map((row) => row.toJSON());

        return { count, orders };
    }

    /**
     * Marks customer's order as delivered.
     *
     * @param orderId - The id of the order
     *
     * @throws {@link OrderNotFoundError}
     * Thrown if the order is not found.
     *
     * @throws {@link OrderAlreadyMarkedError}
     * Thrown if the order is already marked as delivered or canceled.
     */
    public async markAsDelivered(orderId: number): Promise<void> {
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        if (order.status === 'delivered') {
            throw new OrderAlreadyMarkedError();
        }

        if (order.status === 'canceled') {
            throw new OrderAlreadyMarkedError(
                'Cannot mark a canceled order as delivered'
            );
        }

        order.status = 'delivered';
        await order.save();
    }

    /**
     * Cancels a customer's order.
     *
     * @param userId - The id of the user
     * @param orderId - The id of the order
     *
     * @throws {@link OrderNotFoundError}
     * Thrown if the order is not found.
     */
    public async cancelOrder(userId: number, orderId: number): Promise<void> {
        const order = await Order.findOne({
            where: { id: orderId },
            include: {
                model: Customer,
                where: { userId },
                attributes: [],
            },
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        if (order.status !== 'pending') {
            throw new Error(
                'Cannot cancel order. It has passed the "pending" status.'
            );
        }

        order.status = 'canceled';
        await order.save();
    }
}
