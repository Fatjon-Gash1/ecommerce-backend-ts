import { sequelize } from '../config/db';
import { Op, Transaction } from 'sequelize';
import { Order, Customer } from '../models/relational';
import {
    UserNotFoundError,
    OrderNotFoundError,
    InvalidOrderStatusError,
} from '../errors';

interface OrderItemAttributes {
    productId: number;
    quantity: number;
}

interface OrderResponse {
    id?: number;
    paymentMethod: 'card' | 'wallet' | 'bank-transfer';
    status?: 'pending' | 'delivered' | 'canceled';
    trackingNumber?: string;
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
     * @returns A promise resolving to the created order
     */
    public async createOrder(
        userId: number,
        items: OrderItemAttributes[],
        paymentMethod: 'card' | 'wallet' | 'bank-transfer'
    ): Promise<OrderResponse> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const customer = await Customer.findOne({
                where: { userId },
                transaction,
            });

            if (!customer) {
                throw new UserNotFoundError('User of type Customer not found');
            }

            const order = await Order.create(
                {
                    customerId: customer.id,
                    paymentMethod,
                },
                { transaction }
            );

            await Promise.all(
                items.map(async ({ productId, quantity }) => {
                    await order.addItem(productId, quantity, transaction);
                })
            );

            await transaction.commit();
            return {
                id: order.id,
                paymentMethod,
                status: order.status,
                trackingNumber: order.trackingNumber,
                createdAt: order.createdAt,
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Retrieves a specific order by ID.
     *
     * @param orderId - The ID of the order
     * @returns A promise resolving to the order
     */
    public async getOrderById(orderId: number): Promise<OrderResponse> {
        const order = await Order.findByPk(orderId, {
            attributes: [
                'id',
                'paymentMethod',
                'status',
                'trackingNumber',
                'createdAt',
            ],
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        return order.toJSON();
    }

    /**
     * Retrieves all items of a specific order.
     *
     * @param orderId - The ID of the order
     * @returns A promise resolving to an array of OrderItem instances
     */
    public async getOrderItemsByOrderId(
        orderId: number
    ): Promise<OrderItemResponse[]> {
        const order = await Order.findByPk(orderId);

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
     * Retrieves all orders by a given status for a user.
     *
     * @param userId - The ID of the user
     * @returns A promise resolving to an array of Order instances
     *
     * @throws {@link InvalidOrderStatusError}
     * Thrown if the status is not a valid order status.
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user of type Customer is not found.
     */
    public async getOrdersByStatus(
        userId: number,
        status: string
    ): Promise<OrderResponse[]> {
        if (!['pending', 'delivered', 'canceled'].includes(status)) {
            throw new InvalidOrderStatusError();
        }

        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        const orders = await Order.findAll({
            where: { customerId: customer.id, status },
            attributes: [
                'id',
                'paymentMethod',
                'status',
                'trackingNumber',
                'createdAt',
            ],
        });

        return orders.map((order) => order.toJSON());
    }

    /**
     * Retrieves user's order history.
     *
     * @param userId - The ID of the user
     * @returns A promise resolving to an array of Order instances
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user of type Customer is not found.
     */
    public async getOrderHistory(userId: number): Promise<OrderResponse[]> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        const orders = await Order.findAll({
            where: { customerId: customer.id, status: { [Op.not]: 'pending' } },
        });

        return orders.map((order) => order.toJSON());
    }

    /**
     * Retrieves all orders in the database.
     *
     * @returns A promise resolving to an array of Order instances
     */
    public async getAllOrders(): Promise<Order[]> {
        return await Order.findAll();
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

        order.status = 'canceled';
        await order.save();
    }
}
