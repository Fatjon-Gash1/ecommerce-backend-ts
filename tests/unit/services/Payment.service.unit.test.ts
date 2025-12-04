import {
    Customer,
    Order,
    Product,
    Purchase,
    RefundRequest,
} from '@/models/relational';
import {
    OrderNotFoundError,
    ProductNotFoundError,
    UserNotFoundError,
} from '@/errors';

jest.unmock('@/services/Payment.service');
import {
    PaymentService,
    NotificationService,
    ShippingService,
} from '@/services';
import { PaymentProcessingData } from '@/types';

class TestablePaymentService extends PaymentService {
    public exposedStripe = this.getStripe();
    public exposedNotificationService = this.getNotificationService()!;
    public exposedShippingService = this.getShippingService()!;

    public override async refundPayment(
        paymentIntentId: string,
        refundReason: string,
        amount?: number
    ): Promise<void> {
        await super.refundPayment(paymentIntentId, refundReason, amount);
    }
}

describe('PaymentService', () => {
    const paymentService = new TestablePaymentService(
        'abc',
        undefined,
        new ShippingService(),
        new NotificationService()
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPaymentIntent', () => {
        const paymentIntentData = {
            userId: 1,
            amount: 99.99,
        };
        const mockCustomerInstance = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'john.doe',
            membership: 'free',
        };

        it('should throw UserNotFoundError if user is not found', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                paymentService.createPaymentIntent(
                    paymentIntentData.userId,
                    paymentIntentData.amount
                )
            ).rejects.toThrow(UserNotFoundError);

            expect(
                paymentService.exposedStripe.customers.retrieve
            ).not.toHaveBeenCalled();
        });

        it('should throw generic error if stripe customer is mistakenly deleted', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (
                paymentService.exposedStripe.customers.retrieve as jest.Mock
            ).mockResolvedValue({
                deleted: true,
            });

            await expect(
                paymentService.createPaymentIntent(
                    paymentIntentData.userId,
                    paymentIntentData.amount
                )
            ).rejects.toThrow('Stripe customer is mistakenly deleted');
            expect(
                paymentService.exposedStripe.paymentIntents.create
            ).not.toHaveBeenCalled();
        });

        it('should throw generic error if stripe customer has no default payment method', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (
                paymentService.exposedStripe.customers.retrieve as jest.Mock
            ).mockResolvedValue({
                deleted: false,
                invoice_settings: { default_payment_method: null },
            });

            await expect(
                paymentService.createPaymentIntent(
                    paymentIntentData.userId,
                    paymentIntentData.amount
                )
            ).rejects.toThrow('Stripe customer has no default payment method');

            expect(
                paymentService.exposedStripe.paymentIntents.create
            ).not.toHaveBeenCalled();
        });

        it('should create a new payment intent with existing payment method', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (
                paymentService.exposedStripe.customers.retrieve as jest.Mock
            ).mockResolvedValue({
                deleted: false,
                invoice_settings: {
                    default_payment_method: {
                        toString: jest.fn().mockReturnValue('pm_123'),
                    },
                },
            });
            (
                paymentService.exposedStripe.paymentIntents.create as jest.Mock
            ).mockResolvedValue({ id: 'pi_123' });

            await paymentService.createPaymentIntent(
                paymentIntentData.userId,
                paymentIntentData.amount
            );

            expect(
                paymentService.exposedStripe.paymentIntents.create
            ).toHaveBeenCalled();
        });

        it('should create a new payment intent with new payment method', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (
                paymentService.exposedStripe.customers.retrieve as jest.Mock
            ).mockResolvedValue({
                deleted: false,
                invoice_settings: {
                    default_payment_method: {
                        toString: jest.fn().mockReturnValue('pm_123'),
                    },
                },
            });
            (
                paymentService.exposedStripe.paymentIntents.create as jest.Mock
            ).mockResolvedValue({ id: 'pi_123' });

            await paymentService.createPaymentIntent(
                paymentIntentData.userId,
                paymentIntentData.amount,
                'eur',
                'pm_456'
            );

            expect(
                paymentService.exposedStripe.customers.retrieve
            ).not.toHaveBeenCalled();
            expect(
                paymentService.exposedStripe.paymentIntents.create
            ).toHaveBeenCalled();
        });
    });

    describe('createRefundRequest', () => {
        const refundData = {
            userId: 1,
            orderId: 1,
            reason: 'test',
            amount: 99.99,
        };
        const mockCustomerInstance = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'john.doe',
            membership: 'free',
        };
        const mockOrderInstance = {
            paymentIntentId: 'pi_123',
            total: 99.99,
            update: jest.fn(),
        };

        beforeEach(() => {
            paymentService.refundPayment = jest.fn();
        });

        it('should throw UserNotFoundError if user is not found', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                paymentService.createRefundRequest(
                    refundData.userId,
                    refundData.orderId,
                    refundData.reason,
                    refundData.amount
                )
            ).rejects.toThrow(UserNotFoundError);

            expect(Order.findOne).not.toHaveBeenCalled();
        });

        it('should throw OrderNotFoundError if order is not found', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Order.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                paymentService.createRefundRequest(
                    refundData.userId,
                    refundData.orderId,
                    refundData.reason,
                    refundData.amount
                )
            ).rejects.toThrow(OrderNotFoundError);
        });

        it('should refund order if order status is pending', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Order.findOne as jest.Mock).mockResolvedValue({
                ...mockOrderInstance,
                status: 'pending',
            });

            await paymentService.createRefundRequest(
                refundData.userId,
                refundData.orderId,
                refundData.reason,
                refundData.amount
            );

            expect(paymentService.refundPayment).toHaveBeenCalledWith(
                mockOrderInstance.paymentIntentId,
                refundData.reason,
                refundData.amount
            );
            expect(mockOrderInstance.update).toHaveBeenCalled();
            expect(
                paymentService.exposedNotificationService.sendNotification
            ).toHaveBeenCalled();
        });

        it('should throw generic error if order status is neither delivered or pending', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Order.findOne as jest.Mock).mockResolvedValue({
                ...mockOrderInstance,
                status: 'shipped',
            });

            await expect(
                paymentService.createRefundRequest(
                    refundData.userId,
                    refundData.orderId,
                    refundData.reason,
                    refundData.amount
                )
            ).rejects.toThrow(
                'Cannot refund an order that is not delivered or pending'
            );
            expect(RefundRequest.findOrCreate).not.toHaveBeenCalled();
        });

        it('should throw generic error if a refund request is already created', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Order.findOne as jest.Mock).mockResolvedValue({
                ...mockOrderInstance,
                status: 'delivered',
            });
            (RefundRequest.findOrCreate as jest.Mock).mockResolvedValue([
                {},
                false,
            ]);

            await expect(
                paymentService.createRefundRequest(
                    refundData.userId,
                    refundData.orderId,
                    refundData.reason,
                    refundData.amount
                )
            ).rejects.toThrow(
                'Cannot create refund request. A refund request already exists for this order.'
            );

            expect(RefundRequest.findOrCreate).toHaveBeenCalled();
        });

        it('should create a refund request if order status is delivered', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(
                mockCustomerInstance
            );
            (Order.findOne as jest.Mock).mockResolvedValue({
                ...mockOrderInstance,
                status: 'delivered',
            });
            (RefundRequest.findOrCreate as jest.Mock).mockResolvedValue([
                {},
                true,
            ]);

            const result = await paymentService.createRefundRequest(
                refundData.userId,
                refundData.orderId,
                refundData.reason,
                refundData.amount
            );

            expect(paymentService.refundPayment).not.toHaveBeenCalled();
            expect(RefundRequest.findOrCreate).toHaveBeenCalled();
            expect(result).toStrictEqual(true);
        });
    });

    describe('handleRefundRequest', () => {
        const refundData = {
            refundRequestId: 1,
            rejectionReason: 'test',
        };
        const customerData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'john.doe',
            membership: 'free',
            orders: [
                {
                    refundRequest: { status: '', reason: 'test', amount: 0 },
                    trackingNumber: '123',
                    paymentIntentId: 'pi_123',
                    id: '123',
                },
            ],
            user: { email: 'john@example.com' },
        };
        const mockOrderInstance = {
            id: '123',
            paymentIntentId: 'pi_123',
            total: 99.99,
            update: jest.fn(),
        };
        const mockPurchaseInstance = {
            destroy: jest.fn(),
        };
        const foundProducts = [mockPurchaseInstance];

        beforeEach(() => {
            paymentService.refundPayment = jest.fn();
        });

        it('should throw generic error if refund request is not found', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                paymentService.handleRefundRequest(
                    refundData.refundRequestId,
                    'approved',
                    refundData.rejectionReason
                )
            ).rejects.toThrow('Refund request not found');
        });

        it('should throw generic error if refund request data is missing', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                toJSON: jest
                    .fn()
                    .mockReturnValue({ ...customerData, user: false }),
            });

            await expect(
                paymentService.handleRefundRequest(
                    refundData.refundRequestId,
                    'approved',
                    refundData.rejectionReason
                )
            ).rejects.toThrow('Refund request data missing');
        });

        it('should throw generic error if refund request is already handled', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                toJSON: jest.fn().mockReturnValue({
                    ...customerData,
                    orders: [
                        {
                            refundRequest: {
                                status: 'approved',
                                reason: 'test',
                                amount: 0,
                            },
                            trackingNumber: '123',
                            paymentIntentId: 'pi_123',
                            id: '123',
                        },
                    ],
                }),
            });

            await expect(
                paymentService.handleRefundRequest(
                    refundData.refundRequestId,
                    'approved',
                    refundData.rejectionReason
                )
            ).rejects.toThrow('Refund request is already handled');
        });

        it('should throw generic error if action approved with rejection reason', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                toJSON: jest.fn().mockReturnValue({
                    ...customerData,
                    orders: [
                        {
                            refundRequest: {
                                status: 'pending',
                                reason: 'test',
                                amount: 0,
                            },
                            trackingNumber: '123',
                            paymentIntentId: 'pi_123',
                            id: '123',
                        },
                    ],
                }),
            });

            await expect(
                paymentService.handleRefundRequest(
                    refundData.refundRequestId,
                    'approved',
                    refundData.rejectionReason
                )
            ).rejects.toThrow(
                'Action is "approved". Rejection reason is not allowed.'
            );
        });

        it('should approve refund request as a full refund', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                toJSON: jest.fn().mockReturnValue({
                    ...customerData,
                    orders: [
                        {
                            refundRequest: {
                                status: 'pending',
                                reason: 'test',
                                amount: 0,
                            },
                            trackingNumber: '123',
                            paymentIntentId: 'pi_123',
                            id: '123',
                        },
                    ],
                }),
            });
            (Order.findByPk as jest.Mock).mockResolvedValue(mockOrderInstance);
            (Purchase.findAll as jest.Mock).mockResolvedValue(foundProducts);

            await paymentService.handleRefundRequest(
                refundData.refundRequestId,
                'approved'
            );

            expect(paymentService.refundPayment).toHaveBeenCalledWith(
                mockOrderInstance.paymentIntentId,
                `${customerData.orders[0].refundRequest.reason} | Approved by admin.`,
                customerData.orders[0].refundRequest.amount ?? undefined
            );
            expect(Order.findByPk).toHaveBeenCalledWith(
                customerData.orders[0].id
            );
            expect(mockOrderInstance.update).toHaveBeenCalledWith({
                status: customerData.orders[0].refundRequest.amount
                    ? 'partially-refunded'
                    : 'refunded',
            });
            expect(Purchase.findAll).toHaveBeenCalledWith({
                where: { orderId: mockOrderInstance.id },
            });
            expect(mockPurchaseInstance.destroy.mock.calls).toHaveLength(
                foundProducts.length
            );
            expect(RefundRequest.update).toHaveBeenCalledWith(
                { status: 'approved' },
                { where: { id: refundData.refundRequestId } }
            );
            expect(
                (
                    paymentService.exposedNotificationService
                        .sendHandledRefundEmail as jest.Mock
                ).mock.calls[0][0]
            ).toBe(customerData.user.email);
        });

        it('should approve refund request as a partial refund', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                toJSON: jest.fn().mockReturnValue({
                    ...customerData,
                    orders: [
                        {
                            refundRequest: {
                                status: 'pending',
                                reason: 'test',
                                amount: 99.99,
                            },
                            trackingNumber: '123',
                            paymentIntentId: 'pi_123',
                            id: '123',
                        },
                    ],
                }),
            });
            (Order.findByPk as jest.Mock).mockResolvedValue(mockOrderInstance);
            (Purchase.findAndCountAll as jest.Mock).mockResolvedValue({
                rows: foundProducts,
                count: foundProducts.length,
            });

            await paymentService.handleRefundRequest(
                refundData.refundRequestId,
                'approved'
            );

            expect(paymentService.refundPayment).toHaveBeenCalledWith(
                mockOrderInstance.paymentIntentId,
                `${customerData.orders[0].refundRequest.reason} | Approved by admin.`,
                99.99
            );
            expect(Order.findByPk).toHaveBeenCalledWith(
                customerData.orders[0].id
            );
            expect(mockOrderInstance.update).toHaveBeenCalledWith({
                status: 'partially-refunded',
            });
            expect(Purchase.findAll).not.toHaveBeenCalled();
            expect(Purchase.findAndCountAll).toHaveBeenCalledWith({
                where: { orderId: mockOrderInstance.id },
            });
            expect(RefundRequest.update).toHaveBeenCalledWith(
                { status: 'approved' },
                { where: { id: refundData.refundRequestId } }
            );

            expect(
                (
                    paymentService.exposedNotificationService
                        .sendHandledRefundEmail as jest.Mock
                ).mock.calls[0][0]
            ).toBe(customerData.user.email);
        });

        it('should throw generic error if rejection reason not provided for denied requests', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                toJSON: jest.fn().mockReturnValue({
                    ...customerData,
                    orders: [
                        {
                            refundRequest: {
                                status: 'pending',
                                reason: 'test',
                                amount: 0,
                            },
                            trackingNumber: '123',
                            paymentIntentId: 'pi_123',
                            id: '123',
                        },
                    ],
                }),
            });

            await expect(
                paymentService.handleRefundRequest(
                    refundData.refundRequestId,
                    'denied'
                )
            ).rejects.toThrow(
                'Rejection reason is required for "denied" requests'
            );

            expect(RefundRequest.update).not.toHaveBeenCalled();
        });

        it('should deny refund request', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                toJSON: jest.fn().mockReturnValue({
                    ...customerData,
                    orders: [
                        {
                            refundRequest: {
                                status: 'pending',
                                reason: 'test',
                                amount: 0,
                            },
                            trackingNumber: '123',
                            paymentIntentId: 'pi_123',
                            id: '123',
                        },
                    ],
                }),
            });

            await paymentService.handleRefundRequest(
                refundData.refundRequestId,
                'denied',
                'test'
            );

            expect(paymentService.refundPayment).not.toHaveBeenCalled();
            expect(RefundRequest.update).toHaveBeenCalledWith(
                { status: 'denied' },
                { where: { id: refundData.refundRequestId } }
            );
            expect(
                (
                    paymentService.exposedNotificationService
                        .sendHandledRefundEmail as jest.Mock
                ).mock.calls[0][0]
            ).toBe(customerData.user.email);
        });
    });

    describe('cancelMembershipSubscriptionWithRefund', () => {
        const cancellationData = {
            userId: 1,
            customerId: 's_1',
        };
        const subscriptionsData = {
            data: [
                {
                    id: '123',
                    trial_end: Date.now() + 3600,
                    latest_invoice: '123',
                },
            ],
        };
        const invoiceData = { total: 123, charge: 'id_123', amount_paid: 1234 };

        beforeEach(() => {
            paymentService.refundPayment = jest.fn();
        });

        it('should throw generic error if no subscriptions found', async () => {
            (
                paymentService.exposedStripe.subscriptions.list as jest.Mock
            ).mockResolvedValue({ data: [] });

            await expect(
                paymentService.cancelMembershipSubscriptionWithRefund(
                    cancellationData.userId,
                    cancellationData.customerId
                )
            ).rejects.toThrow('No subscriptions found to cancel');
        });

        it('should schedule subscription cancellation at period end', async () => {
            (
                paymentService.exposedStripe.subscriptions.list as jest.Mock
            ).mockResolvedValue(subscriptionsData);

            await paymentService.cancelMembershipSubscriptionWithRefund(
                cancellationData.userId,
                cancellationData.customerId
            );

            expect(
                paymentService.exposedStripe.subscriptions.update as jest.Mock
            ).toHaveBeenCalledWith(subscriptionsData.data[0].id, {
                cancel_at_period_end: true,
            });
        });

        it('should cancel subscription immediately if it has an end trial', async () => {
            (
                paymentService.exposedStripe.subscriptions.list as jest.Mock
            ).mockResolvedValue(subscriptionsData);

            await paymentService.cancelMembershipSubscriptionWithRefund(
                cancellationData.userId,
                cancellationData.customerId,
                true
            );

            expect(
                paymentService.exposedStripe.subscriptions.cancel as jest.Mock
            ).toHaveBeenCalledWith(subscriptionsData.data[0].id);
        });

        it('should cancel subscription immediately with proration', async () => {
            (
                paymentService.exposedStripe.subscriptions.list as jest.Mock
            ).mockResolvedValue({
                data: [
                    {
                        id: '123',
                        trial_end: null,
                    },
                ],
            });

            await paymentService.cancelMembershipSubscriptionWithRefund(
                cancellationData.userId,
                cancellationData.customerId,
                true
            );

            expect(
                paymentService.exposedStripe.subscriptions.cancel as jest.Mock
            ).toHaveBeenCalledWith(subscriptionsData.data[0].id, {
                invoice_now: true,
                prorate: true,
            });
            expect(
                paymentService.exposedStripe.invoices.retrieve as jest.Mock
            ).not.toHaveBeenCalled();
        });

        it('should cancel subscription immediately with proration with new invoices without charge', async () => {
            (
                paymentService.exposedStripe.subscriptions.list as jest.Mock
            ).mockResolvedValue({
                data: [
                    {
                        id: '123',
                        trial_end: null,
                        latest_invoice: '123',
                    },
                ],
            });
            const canceledSubscription = subscriptionsData.data[0];
            (
                paymentService.exposedStripe.subscriptions.cancel as jest.Mock
            ).mockResolvedValueOnce(canceledSubscription);
            (
                paymentService.exposedStripe.invoices.retrieve as jest.Mock
            ).mockResolvedValueOnce({ ...invoiceData, charge: null });
            (
                paymentService.exposedStripe.invoices.retrieve as jest.Mock
            ).mockResolvedValueOnce(invoiceData);

            await paymentService.cancelMembershipSubscriptionWithRefund(
                cancellationData.userId,
                cancellationData.customerId,
                true
            );

            expect(
                paymentService.exposedStripe.subscriptions.cancel as jest.Mock
            ).toHaveBeenCalledWith(subscriptionsData.data[0].id, {
                invoice_now: true,
                prorate: true,
            });
            expect(
                (paymentService.exposedStripe.invoices.retrieve as jest.Mock)
                    .mock.calls.length
            ).toBe(2);
            expect(
                paymentService.exposedStripe.invoices
                    .finalizeInvoice as jest.Mock
            ).toHaveBeenCalledWith(canceledSubscription.latest_invoice);
            expect(
                (
                    paymentService.exposedNotificationService
                        .sendNotification as jest.Mock
                ).mock.calls[0][0]
            ).toBe(cancellationData.userId);
        });

        it('should cancel subscription with proration with refund and update customer balance', async () => {
            (
                paymentService.exposedStripe.subscriptions.list as jest.Mock
            ).mockResolvedValue({
                data: [
                    {
                        id: '123',
                        trial_end: null,
                        latest_invoice: '123',
                    },
                ],
            });
            const canceledSubscription = subscriptionsData.data[0];
            (
                paymentService.exposedStripe.subscriptions.cancel as jest.Mock
            ).mockResolvedValueOnce(canceledSubscription);
            (
                paymentService.exposedStripe.invoices.retrieve as jest.Mock
            ).mockResolvedValueOnce(invoiceData);
            (
                paymentService.exposedStripe.invoices.retrieve as jest.Mock
            ).mockResolvedValueOnce(invoiceData);
            (
                paymentService.exposedStripe.customers.retrieve as jest.Mock
            ).mockResolvedValue({ balance: 0 });

            await paymentService.cancelMembershipSubscriptionWithRefund(
                cancellationData.userId,
                cancellationData.customerId,
                true
            );

            expect(
                paymentService.exposedStripe.subscriptions.cancel as jest.Mock
            ).toHaveBeenCalledWith(subscriptionsData.data[0].id, {
                invoice_now: true,
                prorate: true,
            });
            expect(
                (paymentService.exposedStripe.invoices.retrieve as jest.Mock)
                    .mock.calls.length
            ).toBe(2);
            expect(
                paymentService.exposedStripe.refunds.create as jest.Mock
            ).toHaveBeenCalled();
            expect(
                paymentService.exposedStripe.invoices
                    .finalizeInvoice as jest.Mock
            ).toHaveBeenCalledWith(canceledSubscription.latest_invoice);
            expect(
                paymentService.exposedStripe.customers.retrieve as jest.Mock
            ).toHaveBeenCalledWith(cancellationData.customerId);
            expect(
                (paymentService.exposedStripe.customers.update as jest.Mock)
                    .mock.calls[0][0]
            ).toBe(cancellationData.customerId);
            expect(
                (
                    paymentService.exposedNotificationService
                        .sendNotification as jest.Mock
                ).mock.calls[0][0]
            ).toBe(cancellationData.userId);
        });
    });

    describe('processPayment', () => {
        const userId = 1;
        const paymentData: PaymentProcessingData = {
            orderItems: [{ productId: 1, quantity: 1, purchasePrice: 12.99 }],
            shippingCountry: 'testCountry',
            shippingMethod: 'standard',
            currency: 'eur',
            paymentMethodType: 'card',
            paymentMethodId: 'pm_123',
        };
        const mockCustomerInstance = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'john.doe',
            membership: 'free',
            save: jest.fn(),
        };
        const baseProductContent = {
            id: 2,
            name: 'Apple',
            imageUrls: ['https://example.com/apple.jpg'],
            price: 10.99,
            discount: 20,
        };
        const mockProductInstance = {
            ...baseProductContent,
            save: jest.fn(),
            toJSON: jest.fn().mockReturnValue({
                CartItem: { quantity: 10 },
                ...baseProductContent,
            }),
        };

        beforeEach(() => {
            paymentService.createPaymentIntent = jest
                .fn()
                .mockResolvedValue('pi_123');
            (
                paymentService.exposedShippingService
                    .calculateShippingCost as jest.Mock
            ).mockResolvedValue({
                cost: 5.99,
                weightCategory: 'light',
                orderWeight: 5,
            });
        });

        it('should throw UserNotFoundError if customer is not found', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                paymentService.processPayment(userId, paymentData)
            ).rejects.toThrow(UserNotFoundError);
        });

        it('should throw generic error if safe shipping is paid for premium customers', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                ...mockCustomerInstance,
                membership: 'plus',
            });

            await expect(
                paymentService.processPayment(userId, {
                    ...paymentData,
                    safeShippingPaid: true,
                })
            ).rejects.toThrow(
                'You already have safe shipping enabled. No need to pay extra'
            );
        });

        it("should throw ProductNotFoundError if order item's product is not found", async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                ...mockCustomerInstance,
            });
            (Product.findByPk as jest.Mock).mockResolvedValue(null);

            await expect(
                paymentService.processPayment(userId, {
                    ...paymentData,
                })
            ).rejects.toThrow(ProductNotFoundError);
        });

        it('should process payment', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue({
                ...mockCustomerInstance,
                loyaltyPoints: 100,
                safeShippingPaid: false,
            });
            (Product.findByPk as jest.Mock).mockResolvedValue(
                mockProductInstance
            );

            await paymentService.processPayment(userId, {
                ...paymentData,
                loyaltyPoints: 100,
            });

            expect((Product.findByPk as jest.Mock).mock.calls.length).toBe(
                paymentData.orderItems.length
            );
            expect(
                paymentService.exposedShippingService.calculateShippingCost
            ).toHaveBeenCalledWith(
                paymentData.shippingCountry,
                paymentData.shippingMethod,
                undefined,
                paymentData.orderItems,
                paymentData.safeShippingPaid
            );
            expect(paymentService.createPaymentIntent).toHaveBeenCalled();
            expect(mockCustomerInstance.save).toHaveBeenCalled();
        });
    });
});
