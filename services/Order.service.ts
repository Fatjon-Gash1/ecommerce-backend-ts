import { sequelize } from '@/config/db';
import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';
import { Order, Customer, Courier } from '@/models/relational';
import { UserNotFoundError, OrderNotFoundError } from '@/errors';
import { OrderItemAttributes, OrderResponse, OrderItemResponse } from '@/types';

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
        weightCategory:
            | 'light'
            | 'standard'
            | 'heavy'
            | 'very-heavy'
            | 'extra-heavy',
        orderWeight: number,
        shippingMethod: 'standard' | 'express' | 'next-day',
        orderTotal: number,
        paymentIntentId: string,
        safeShippingPaid?: boolean,
        transactionObj?: Transaction
    ): Promise<OrderResponse> {
        const transaction: Transaction =
            transactionObj ?? (await sequelize.transaction());
        let safeShipping: boolean | undefined;

        try {
            const customer = await Customer.findOne({
                where: { userId },
                transaction,
            });

            if (!customer) {
                throw new UserNotFoundError('Customer not found');
            }

            if (safeShippingPaid || customer.membership !== 'free') {
                safeShipping = true;
            }

            const order = await Order.create(
                {
                    customerId: customer.id,
                    paymentMethod,
                    shippingCountry,
                    weightCategory,
                    orderWeight,
                    shippingMethod,
                    total: orderTotal,
                    paymentIntentId,
                    safeShipping,
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
     * @param orderId - The ID of the order
     * @param [userId] - The ID of the user
     * @returns A promise resolving to the order
     */
    public async getOrderById(
        orderId: number,
        userId?: number
    ): Promise<OrderResponse> {
        let order: Order | null;

        if (userId) {
            order = await Order.findOne({
                where: { id: orderId },
                attributes: { exclude: ['customerId'] },
                include: {
                    model: Customer,
                    as: 'customer',
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

        return order.toJSON();
    }

    /**
     * Retrieves all items of a specific order.
     *
     * @param orderId - The ID of the order
     * @param [userId] - The id of the user
     * @returns A promise resolving to an array of OrderItem instances
     *
     * @throws {@link OrderNotFoundError}
     * Thrown if the order is not found.
     */
    public async getOrderItemsByOrderId(
        orderId: number,
        userId?: number
    ): Promise<OrderItemResponse[]> {
        let order: Order | null;

        if (userId) {
            order = await Order.findOne({
                where: { id: orderId },
                include: {
                    model: Customer,
                    as: 'customer',
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
            const { ['OrderItem']: orderItem, ...product } = item.toJSON();
            return { ...product, quantity: orderItem!.quantity };
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
                as: 'customer',
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
     * Retrieves all orders of a given status for a customer.
     * If no status is provided, it returns the order history.
     *
     * @remarks
     * The orders are retrieved for a customer either by their id
     * or their implicit id.
     *
     * @param [customerId] - The id of the customer
     * @param [userId] - The id of the user "Implicit customer id"
     * @param [status] - The status of the order
     * @returns A promise resolving to an array of order instances
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the customer is not found.
     */
    public async getCustomerOrdersByStatus(
        customerId?: number,
        userId?: number,
        status?: string
    ): Promise<{ count: number; orders: OrderResponse[] }> {
        let retrievedId: number;

        if (customerId) {
            const customer = await Customer.findByPk(customerId);
            if (!customer) {
                throw new UserNotFoundError('Customer not found');
            }
            retrievedId = customer.id;
        } else if (userId) {
            const customer = await Customer.findOne({ where: { userId } });
            if (!customer) {
                throw new UserNotFoundError('Customer not found');
            }
            retrievedId = customer.id;
        }

        if (status) {
            const { count, rows } = await Order.findAndCountAll({
                where: { customerId: retrievedId!, status },
            });
            const orders = rows.map((row) => row.toJSON());

            return { count, orders };
        }

        const { count, rows } = await Order.findAndCountAll({
            where: {
                customerId: retrievedId!,
                status: {
                    [Op.not]: ['pending', 'shipped', 'awaiting pickup'],
                },
            },
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
     * Rate delivered order.
     *
     * @param userId - The id of the user
     * @param orderId - The id of the order
     * @param rating - The rating to be given
     */
    public async rateDeliveredOrder(
        userId: number,
        orderId: number,
        rating: number
    ): Promise<void> {
        const order = await Order.findByPk(orderId, {
            attributes: ['status', 'rating'],
            include: {
                model: Customer,
                as: 'customer',
                where: { userId },
                attributes: [],
            },
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        if (order.status !== 'delivered') {
            throw new Error('Cannot rate order. Order is not delivered.');
        }

        await Order.update({ rating }, { where: { id: orderId } });
    }

    /**
     * Marks order as shipped, awaiting pickup, or delivered.
     *
     * @param userId - The id of the user
     * @param orderId - The id of the order
     * @param status - The status to mark the order as
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found.
     *
     * @throws {@link OrderNotFoundError}
     * Thrown if the order is not found.
     */
    public async markOrder(
        userId: number,
        orderId: number,
        status: 'shipped' | 'awaiting pickup' | 'delivered' | 'uncollected',
        deliveryImageUrl?: string
    ): Promise<void> {
        const courier = await Courier.findOne({ where: { userId } });

        if (!courier) {
            throw new UserNotFoundError('Courier not found');
        }

        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        if (status === 'delivered' && order.safeShipping) {
            if (order.status !== 'awaiting pickup') {
                throw new Error(
                    'Cannot mark order as delivered. Order status is: ' +
                        order.status
                );
            }
            if (!deliveryImageUrl) {
                // In this case image would be a signature
                throw new Error('Delivery proof image is required');
            }
            order.proofOfDeliveryImageUrl = deliveryImageUrl;
            order.status = status;
            await order.save();
            return;
        }

        switch (status) {
            case 'shipped': {
                if (order.status !== 'pending') {
                    throw new Error(
                        'Order cannot be marked as shipped. Order status is: ' +
                            order.status
                    );
                }
                order.status = status;
                order.courierId = courier.id;
                await order.save();
                break;
            }
            case 'awaiting pickup': {
                if (!order.safeShipping) {
                    throw new Error(
                        'Cannot mark order as awaiting pickup. Order does not have safe shipping'
                    );
                }
                if (order.status !== 'shipped') {
                    throw new Error(
                        'Cannot mark order as awaiting pickup. Order status is: ' +
                            order.status
                    );
                }

                order.status = status;
                await order.save();
                break;
            }
            case 'delivered': {
                if (order.status !== 'shipped') {
                    throw new Error(
                        'Cannot mark order as delivered. Order status is: ' +
                            order.status
                    );
                }
                if (!deliveryImageUrl) {
                    // In this case image would be a package capture
                    throw new Error('Delivery proof image is required');
                }
                order.proofOfDeliveryImageUrl = deliveryImageUrl;
                order.status = status;
                await order.save();
                break;
            }
            case 'uncollected': {
                if (order.status !== 'awaiting pickup') {
                    throw new Error(
                        'Cannot mark order as uncollected. Order status is: ' +
                            order.status
                    );
                }
                order.status = status;
                await order.save();
                break;
            }
        }
    }
}
