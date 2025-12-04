import { OrderService } from '@/services';
import { Customer, Cart, Order } from '@/models/relational';
import { CartNotFoundError, UserNotFoundError } from '@/errors';
import { getSequelize } from '@/config/db';
import { OrderCreationData } from '@/types';
import type { Transaction } from 'sequelize';
const sequelize = getSequelize();

describe('OrderService', () => {
    const orderService = new OrderService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        const mockOrderData: OrderCreationData = {
            userId: 1,
            items: [
                {
                    productId: 1,
                    quantity: 10,
                },
                {
                    productId: 2,
                    quantity: 15,
                },
            ],
            paymentMethod: 'card',
            shippingCountry: 'germany',
            weightCategory: 'light',
            orderWeight: 10,
            shippingMethod: 'standard',
            orderTotal: 10.99,
            paymentIntentId: 'payment_intent_id',
            safeShippingPaid: true,
        };
        const mockCustomerInstance = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'john.doe',
            membership: 'free',
        };

        let mockCartInstance: Partial<Cart>;
        let mockTransaction: Partial<Transaction>;
        let mockOrderInstance: Partial<Order>;

        beforeEach(() => {
            mockCartInstance = {
                removeProducts: jest.fn(),
            };
            mockTransaction = {
                commit: jest.fn(),
                rollback: jest.fn(),
            };
            mockOrderInstance = {
                addItem: jest.fn(),
                toJSON: jest.fn(),
            };

            (Order.create as jest.Mock).mockResolvedValue(mockOrderInstance);

            jest.spyOn(sequelize, 'transaction').mockResolvedValue(
                mockTransaction as unknown as Transaction
            );
        });

        it('should throw UserNotFoundError if customer is not found', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                orderService.createOrder(
                    mockOrderData.userId,
                    mockOrderData.items,
                    mockOrderData.paymentMethod,
                    mockOrderData.shippingCountry,
                    mockOrderData.weightCategory,
                    mockOrderData.orderWeight,
                    mockOrderData.shippingMethod,
                    mockOrderData.orderTotal,
                    mockOrderData.paymentIntentId,
                    mockOrderData.safeShippingPaid
                )
            ).rejects.toThrow(UserNotFoundError);

            expect(Order.create).not.toHaveBeenCalled();
            expect(mockTransaction.commit).not.toHaveBeenCalled();
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('should throw CartNotFoundError if cart is not found', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Cart.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                orderService.createOrder(
                    mockOrderData.userId,
                    mockOrderData.items,
                    mockOrderData.paymentMethod,
                    mockOrderData.shippingCountry,
                    mockOrderData.weightCategory,
                    mockOrderData.orderWeight,
                    mockOrderData.shippingMethod,
                    mockOrderData.orderTotal,
                    mockOrderData.paymentIntentId,
                    mockOrderData.safeShippingPaid
                )
            ).rejects.toThrow(CartNotFoundError);

            expect(mockOrderInstance.addItem).toHaveBeenCalledTimes(2);
            expect(mockTransaction.commit).not.toHaveBeenCalled();
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('should create an order and clear the cart (internal transaction)', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Cart.findOne as jest.Mock).mockResolvedValue(mockCartInstance);

            await orderService.createOrder(
                mockOrderData.userId,
                mockOrderData.items,
                mockOrderData.paymentMethod,
                mockOrderData.shippingCountry,
                mockOrderData.weightCategory,
                mockOrderData.orderWeight,
                mockOrderData.shippingMethod,
                mockOrderData.orderTotal,
                mockOrderData.paymentIntentId,
                mockOrderData.safeShippingPaid
            );

            expect(mockOrderInstance.addItem).toHaveBeenCalledTimes(
                mockOrderData.items.length
            );
            mockOrderData.items.forEach(({ productId, quantity }, index) => {
                expect(mockOrderInstance.addItem).toHaveBeenNthCalledWith(
                    index + 1,
                    productId,
                    quantity,
                    mockTransaction
                );
            });
            expect(mockCartInstance.removeProducts).toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
        });

        it('should create an order and clear the cart (external transaction)', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Cart.findOne as jest.Mock).mockResolvedValue(mockCartInstance);

            await orderService.createOrder(
                mockOrderData.userId,
                mockOrderData.items,
                mockOrderData.paymentMethod,
                mockOrderData.shippingCountry,
                mockOrderData.weightCategory,
                mockOrderData.orderWeight,
                mockOrderData.shippingMethod,
                mockOrderData.orderTotal,
                mockOrderData.paymentIntentId,
                mockOrderData.safeShippingPaid,
                mockTransaction as Transaction
            );

            expect(mockOrderInstance.addItem).toHaveBeenCalledTimes(
                mockOrderData.items.length
            );
            mockOrderData.items.forEach(({ productId, quantity }, index) => {
                expect(mockOrderInstance.addItem).toHaveBeenNthCalledWith(
                    index + 1,
                    productId,
                    quantity,
                    mockTransaction
                );
            });
            expect(mockCartInstance.removeProducts).toHaveBeenCalled();
            expect(mockTransaction.commit).not.toHaveBeenCalled();
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
        });
    });
});
