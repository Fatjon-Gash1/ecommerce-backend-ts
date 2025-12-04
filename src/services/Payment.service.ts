import Stripe from 'stripe';
import dotenv from 'dotenv';
import pLimit from 'p-limit';
import { OrderService } from './Order.service';
import { ShippingService } from './Shipping.service';
import { NotificationService } from './Notification.service';
import {
    Customer,
    Order,
    Product,
    User,
    RefundRequest,
    Purchase,
} from '@/models/relational';
import {
    OrderNotFoundError,
    ProductNotFoundError,
    UserNotFoundError,
} from '@/errors';
import {
    PaymentMethodResponse,
    SetupIntentResponse,
    MembershipSubscribeDetails,
    PaymentProductDetails,
    PaymentProcessingData,
    RefundRequestResponse,
    SubscriptionFormattedResponse,
} from '@/types';
import { ProcessedPaymentResponse } from '@/types/Payment.types';

dotenv.config();

const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
});

/**
 * Service responsible for all payment related tasks.
 */
export class PaymentService {
    private stripe: Stripe;
    private orderService?: OrderService;
    private shippingService?: ShippingService;
    private notificationService?: NotificationService;

    constructor(
        stripeKey: string,
        orderService?: OrderService,
        shippingService?: ShippingService,
        notificationService?: NotificationService
    ) {
        this.stripe = new Stripe(stripeKey);
        this.orderService = orderService;
        this.shippingService = shippingService;
        this.notificationService = notificationService;
    }

    protected getStripe(): Stripe {
        return this.stripe;
    }

    protected getNotificationService(): NotificationService | null {
        return this.notificationService ?? null;
    }

    protected getShippingService(): ShippingService | null {
        return this.shippingService ?? null;
    }

    /**
     * Creates a new stripe customer.
     *
     * @param name - Name of the customer
     * @param email - Email of the customer
     * @returns A Promise resolving to the Stripe customer id
     */
    public async createCustomer(name: string, email: string): Promise<string> {
        const stripeCustomer = await this.stripe.customers.create({
            name,
            email,
        });

        return stripeCustomer.id;
    }

    /**
     * Removes a stripe customer.
     *
     * @param customerId - Stripe customer id
     */
    public async deleteCustomer(customerId: string): Promise<void> {
        await this.stripe.customers.del(customerId);
    }

    private async createPaymentMethod(
        type: 'card',
        token: string
    ): Promise<string> {
        const paymentMethod = await this.stripe.paymentMethods.create({
            type,
            card: { token },
        });

        return paymentMethod.id;
    }

    private async createSetupIntent(
        customerId: string,
        paymentMethodId: string
    ): Promise<SetupIntentResponse> {
        const setupIntent = await this.stripe.setupIntents.create({
            confirm: true,
            customer: customerId,
            payment_method: paymentMethodId,
            return_url: 'http://localhost:3000/success', // Only for testing
        });

        return {
            customer: setupIntent.customer as string,
            payment_method: setupIntent.payment_method as string,
        };
    }

    public async addPaymentDetails(
        userId: number,
        paymentType: 'card',
        token: string
    ) {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const paymentMethodId = await this.createPaymentMethod(
            paymentType,
            token
        );

        await this.createSetupIntent(customer.stripeId!, paymentMethodId);

        const setupIntents = await this.stripe.setupIntents.list({
            customer: customer.stripeId,
        });

        if (setupIntents.data.length === 1) {
            await this.stripe.customers.update(customer.stripeId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }
    }

    public async setDefaultPaymentMethod(
        userId: number,
        paymentMethodId: string
    ): Promise<void> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        await this.stripe.customers.update(customer.stripeId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
    }

    /**
     * Retrieve all customer's payment methods.
     *
     * @param userId - The user id of the customer
     * @returns A promise resolving to an array of payment methods
     */
    public async getPaymentMethods(
        userId: number
    ): Promise<PaymentMethodResponse[]> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const paymentMethods = await this.stripe.customers.listPaymentMethods(
            customer.stripeId!
        );

        return paymentMethods.data.map((pm) => {
            return {
                id: pm.id,
                type: pm.type,
                card: {
                    brand: pm.card?.brand,
                    country: pm.card?.country,
                    exp_month: pm.card?.exp_month,
                    exp_year: pm.card?.exp_year,
                    funding: pm.card?.funding,
                    last4: pm.card?.last4,
                },
                created: pm.created,
            };
        });
    }

    /**
     * Retrieves a customer's payment method by its id.
     *
     * @param userId - The user id of the customer
     * @param paymentMethodId - The payment method id to retrieve
     * @returns A promise resolving to the payment method object
     */
    public async getPaymentMethodById(
        userId: number,
        paymentMethodId: string
    ): Promise<PaymentMethodResponse> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const paymentMethod = await this.stripe.customers.retrievePaymentMethod(
            customer.stripeId!,
            paymentMethodId
        );

        return {
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: {
                brand: paymentMethod.card?.brand,
                country: paymentMethod.card?.country,
                exp_month: paymentMethod.card?.exp_month,
                exp_year: paymentMethod.card?.exp_year,
                funding: paymentMethod.card?.funding,
                last4: paymentMethod.card?.last4,
            },
            created: paymentMethod.created,
        };
    }

    /**
     * Retrieves customer subscription
     *
     * @remarks
     * This method is called from the subscription service.
     *
     * @param customerId - The Stripe customer id
     * @returns A promise resolving to the customer subscription object
     */
    public async getCustomerSubscription(
        customerId: string
    ): Promise<SubscriptionFormattedResponse | null> {
        const { ['data']: subscription } = await this.stripe.subscriptions.list(
            {
                customer: customerId,
            }
        );
        if (subscription.length === 0) {
            return null;
        }

        const price = subscription[0].items.data[0].plan.amount;

        return {
            plan: subscription[0].items.data[0].plan.interval,
            price: price ? price / 100 : null,
            status: subscription[0].canceled_at ? 'canceled' : 'active',
            created: new Date(subscription[0].created * 1000),
        };
    }

    /**
     * Checks if customer has canceled subscriptions.
     *
     * @param customerId - The id of the customer to check
     * @returns A promise resolving to a boolean
     */
    public async hasCanceledSubscriptions(
        customerId: string
    ): Promise<boolean> {
        const { ['data']: subscriptions } =
            await this.stripe.subscriptions.list({
                customer: customerId,
                status: 'canceled',
            });

        return subscriptions.length > 0;
    }

    /**
     * Updates a customer's payment method by its id.
     *
     * @param userId - The user id of the customer
     * @param paymentMethodId - The payment method id to update
     * @param [expMonth] - The card expiration month
     * @param [expYear] - The card expiration year
     * @returns A promise resolving to the updated payment method object
     */
    public async updatePaymentMethod(
        userId: number,
        paymentMethodId: string,
        expMonth?: number,
        expYear?: number
    ): Promise<PaymentMethodResponse> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const paymentMethod = await this.stripe.paymentMethods.update(
            paymentMethodId,
            {
                card: {
                    exp_month: expMonth,
                    exp_year: expYear,
                },
            }
        );

        return {
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: {
                brand: paymentMethod.card?.brand,
                country: paymentMethod.card?.country,
                exp_month: paymentMethod.card?.exp_month,
                exp_year: paymentMethod.card?.exp_year,
                funding: paymentMethod.card?.funding,
                last4: paymentMethod.card?.last4,
            },
            created: paymentMethod.created,
        };
    }

    /**
     * Delete (Detach) a payment method from a customer.
     *
     * @param userId - The user id of the customer
     * @param paymentMethodId - The payment method id to delete
     */
    public async deletePaymentMethod(
        userId: number,
        paymentMethodId: string
    ): Promise<void> {
        await this.getPaymentMethodById(userId, paymentMethodId);

        await this.stripe.paymentMethods.detach(paymentMethodId);
    }

    /**
     * Create a payment intent using the Stripe API.
     *
     * @param userId - The user id of the customer
     * @param amount - The amount to charge (in smallest currency unit, such as cents).
     * @param currency - Currency for the payment, 'usd' or 'eur'.
     * @param [paymentMethodId] - The customer's payment method id
     * @returns A Promise resolving to the created payment intent id.
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found.
     *
     * @throws {Error}
     * Thrown if the stripe customer is deleted.
     */
    public async createPaymentIntent(
        userId: number,
        amount: number,
        currency: 'usd' | 'eur' = 'eur',
        paymentMethodId?: string
    ): Promise<string> {
        let stripeCustomer;
        let fetchedPaymentMethodId;

        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        if (!paymentMethodId) {
            stripeCustomer = await this.stripe.customers.retrieve(
                customer.stripeId
            );

            if (stripeCustomer.deleted) {
                throw new Error('Stripe customer is mistakenly deleted');
            }

            if (!stripeCustomer.invoice_settings.default_payment_method) {
                throw new Error(
                    'Stripe customer has no default payment method'
                );
            }

            fetchedPaymentMethodId =
                stripeCustomer.invoice_settings.default_payment_method.toString();
        }

        return (
            await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                confirm: true,
                currency,
                customer: customer.stripeId,
                payment_method: paymentMethodId ?? fetchedPaymentMethodId,
                return_url: 'http://localhost:3000/success',
            })
        ).id;
    }

    /**
     * Retrieve a payment intent by its ID.
     *
     * @param paymentIntentId - The ID of the payment intent to retrieve.
     * @returns A Promise resolving to the retrieved payment intent.
     *
     * @throws {Error}
     * Thrown if it fails to retrieve the payment intent.
     */
    public async getPaymentIntentsForCustomer(
        userId: number
    ): Promise<string[]> {
        const customer = await Customer.findOne({ where: { userId } });

        const paymentIntents = await this.stripe.paymentIntents.list({
            customer: customer!.stripeId,
        });

        return paymentIntents.data.map((item) => item.id);
    }

    /**
     * Refunds a payment intent.
     *
     * @param paymentIntentId - The ID of the payment intent to refund
     * @param refundReason - The reason for the refund
     * @param [amount]- The amount to refund
     */
    protected async refundPayment(
        paymentIntentId: string,
        refundReason: string,
        amount?: number
    ): Promise<void> {
        await this.stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount && amount * 100,
            metadata: { refundReason },
        });
    }

    /**
     * Creates a refund request for an order.
     *
     * @remarks
     * This method can be only called by customers.
     * The request is reviewed by a support agent or admin before the refund is processed.
     *
     * @param userId - The user ID of the customer
     * @param orderId - The ID of the order to refund
     * @param reason - The reason for the refund request
     * @param [amount] - The amount to refund
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the customer is not found.
     *
     * @throws {@link OrderNotFoundError}
     * Thrown if the order is not found.
     */
    public async createRefundRequest(
        userId: number,
        orderId: number,
        reason: string,
        amount?: number
    ): Promise<boolean | void> {
        const customer = await Customer.findOne({
            where: { userId },
        });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const order = await Order.findOne({
            where: { id: orderId, customerId: customer.id },
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        if (order.status === 'pending') {
            await this.refundPayment(order.paymentIntentId, reason, amount);

            await order.update({
                status: amount ? 'partially-refunded' : 'refunded',
            });

            return await this.notificationService!.sendNotification(
                userId,
                'Order refunded successfully',
                ...(amount
                    ? [
                          `${formatter.format(amount)} out of ${formatter.format(order.total)} were refunded.`,
                      ]
                    : [`${formatter.format(order.total)} were refunded.`])
            );
        }

        if (order.status !== 'delivered') {
            throw new Error(
                'Cannot refund an order that is not delivered or pending'
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_request, created] = await RefundRequest.findOrCreate({
            where: { orderId },
            defaults: {
                customerId: customer.id,
                orderId,
                reason,
                amount,
            },
        });

        if (!created) {
            throw new Error(
                'Cannot create refund request. A refund request already exists for this order.'
            );
        }

        return true;
    }

    /**
     * Retrieves refund requests.
     *
     * @remarks
     * This method can only be called by support or admins.
     *
     * @param [filter] - Optional filter object
     * @returns - A promise resolving to an array of refund requests.
     */
    public async getRefundRequests(filter?: {
        customerId?: number;
        status?: 'pending' | 'approved' | 'denied';
    }): Promise<{ requests: RefundRequestResponse[]; total: number }> {
        for (const key in filter) {
            const typedKey = key as keyof typeof filter;
            if (filter[typedKey] === undefined) {
                delete filter[typedKey];
            }
        }
        const whereClause =
            filter && (filter.customerId || filter.status)
                ? { where: filter }
                : undefined;

        const { rows, count } =
            await RefundRequest.findAndCountAll(whereClause);

        return {
            requests: rows.map((request) => request.toJSON()),
            total: count,
        };
    }

    /**
     * Retrieve customer's refund requests.
     *
     * @remarks
     * This method can only be called by support or admins.
     *
     * @param userId - The user ID of the customer
     * @returns - A promise resolving to an array of refund requests.
     */
    public async getCustomerRefundRequests(
        userId: number
    ): Promise<RefundRequestResponse[]> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const requests = await RefundRequest.findAll({
            where: { customerId: customer.id },
            attributes: { exclude: ['updatedAt', 'customerId'] },
        });

        return requests.map((request) => request.toJSON());
    }

    /**
     * Handles the refund request for an order.
     *
     * @remarks
     * This method can only be called by support or admins.
     *
     * @param refundRequestId - The ID of the refund request
     * @param action - The action to take (deny or approve)
     */
    public async handleRefundRequest(
        refundRequestId: number,
        action: 'approved' | 'denied',
        rejectionReason?: string
    ): Promise<void> {
        const customer = await Customer.findOne({
            include: [
                { model: User, as: 'user', attributes: ['email'] },
                {
                    model: Order,
                    as: 'orders',
                    attributes: [
                        'id',
                        'paymentIntentId',
                        'trackingNumber',
                        'total',
                    ],
                    include: [
                        {
                            model: RefundRequest,
                            as: 'refundRequest',
                            attributes: ['reason', 'amount', 'status'],
                            where: { id: refundRequestId },
                        },
                    ],
                },
            ],
            attributes: [],
        });

        if (!customer) {
            throw new Error('Refund request not found');
        }

        const customerData: Customer = customer.toJSON();

        const { ['refundRequest']: request, ...order } =
            customerData.orders![0];

        if (!customerData.user || !request || !order) {
            throw new Error('Refund request data missing');
        }

        if (request.status !== 'pending') {
            throw new Error('Refund request is already handled');
        }

        if (action === 'approved') {
            if (rejectionReason) {
                throw new Error(
                    'Action is "approved". Rejection reason is not allowed.'
                );
            }

            await this.refundPayment(
                order.paymentIntentId,
                `${request.reason} | Approved by admin.`,
                request.amount ?? undefined
            );
            const foundOrder = await Order.findByPk(order.id);

            await foundOrder!.update({
                status: request.amount ? 'partially-refunded' : 'refunded',
            });

            if (!request.amount) {
                const orderProducts = await Purchase.findAll({
                    where: { orderId: foundOrder!.id },
                });

                orderProducts.map(async (product) => {
                    await product.destroy();
                });
            } else {
                const { rows, count } = await Purchase.findAndCountAll({
                    where: { orderId: foundOrder!.id },
                });

                const removalCount =
                    ((foundOrder!.total - request.amount) / foundOrder!.total) *
                    count;

                for (let i = 0; i < removalCount; i++) {
                    await rows[i].destroy();
                }
            }
        } else if (!rejectionReason) {
            throw new Error(
                'Rejection reason is required for "denied" requests'
            );
        }

        await RefundRequest.update(
            { status: action },
            { where: { id: refundRequestId } }
        );

        await this.notificationService!.sendHandledRefundEmail(
            customerData.user.email,
            {
                status: action,
                orderTrackingNumber: order.trackingNumber,
                orderTotal: formatter.format(order.total),
                refundAmount: request.amount
                    ? formatter.format(request.amount)
                    : null,
                rejectionReason,
            }
        );
    }

    // Not Used
    public async createProduct(details: PaymentProductDetails): Promise<{
        productId: string;
        priceId: string;
    }> {
        const newProduct = await this.stripe.products.create({
            name: details.name,
        });

        const priceObj = await this.stripe.prices.create({
            billing_scheme: 'per_unit',
            currency: details.currency,
            product: newProduct.id,
            unit_amount_decimal: String(details.price * 100),
        });

        await this.stripe.products.update(newProduct.id, {
            default_price: priceObj.id,
        });

        return {
            productId: newProduct.id,
            priceId: priceObj.id,
        };
    }

    /** Retrieves subscribed customers by membership price and cancels their subscriptions.
     *
     * @remarks
     * This method is called from the subscription service.
     *
     * @param priceId - The price id of the membership plan
     * @returns A promise resolving to an array of stripe customer ids
     */
    public async retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions(
        priceId: string
    ): Promise<Map<string, number>> {
        const limit = pLimit(10);
        const subscriptions = await this.stripe.subscriptions.list({
            price: priceId,
        });

        const customerSubscriptionData = new Map<string, number>();

        subscriptions.data.forEach((subscription) =>
            customerSubscriptionData.set(
                subscription.customer.toString(),
                subscription.current_period_end
            )
        );

        const cancellationPromises = subscriptions.data.map((subscription) =>
            limit(() =>
                this.stripe.subscriptions.update(subscription.id, {
                    cancel_at_period_end: true,
                })
            )
        );

        await Promise.allSettled(cancellationPromises);

        return customerSubscriptionData;
    }

    /**
     * Creates new subscriptions for a set of customers.
     *
     * @remarks
     * This method is called from the subscription service.
     *
     * @param customerIds - A map that contains the customer id and the end of the current period
     * @param priceId - The price id of the membership plan
     */
    public async createSubscriptionsForCustomers(
        subscriptionData: Map<string, number>,
        priceId: string
    ): Promise<void> {
        const limit = pLimit(10);

        const creationPromises = Array.from(subscriptionData.entries()).map(
            ([customerId, endOfPeriod]) =>
                limit(() =>
                    this.stripe.subscriptions.create({
                        customer: customerId,
                        currency: 'eur',
                        items: [
                            {
                                price: priceId,
                                quantity: 1,
                            },
                        ],
                        off_session: true,
                        proration_behavior: 'none',
                        trial_end: endOfPeriod,
                    })
                )
        );

        await Promise.allSettled(creationPromises);
    }

    /**
     * Extends the customer membership subscription.
     *
     * @remarks This method is called from the subscription service.
     *
     * @param customerId - The id of the customer to create a subscription for
     * @param priceId - The membership annual or monthly priceId
     * @param endOfPeriod - The end of the subscription period
     */
    public async extendMembershipSubscription(
        customerId: string,
        priceId: string,
        endOfPeriod: number
    ): Promise<void> {
        await this.stripe.subscriptions.create({
            customer: customerId,
            currency: 'eur',
            items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            off_session: true,
            proration_behavior: 'none',
            trial_end: endOfPeriod,
        });
    }

    /**
     * Updates a stripe membership product along with its related prices.
     *
     * @remarks
     * This method is called from the subscription service.
     *
     * @param productId - The id of the product to update
     * @param priceType - The type of the price (annual, monthly)
     * @param price - The price of the product
     * @returns A promise resolving to the new price id
     */
    public async updateMembership(
        productId: string,
        priceType: 'annual' | 'monthly',
        price: number
    ): Promise<string> {
        const { id } = await this.stripe.prices.create({
            billing_scheme: 'per_unit',
            currency: 'eur',
            product: productId,
            recurring: {
                interval: priceType === 'annual' ? 'year' : 'month',
                interval_count: 1,
                usage_type: 'licensed',
            },
            unit_amount_decimal: String(price * 100),
        });

        await this.stripe.products.update(productId, {
            default_price: id,
        });

        return id;
    }

    /**
     * Creates a discount coupon and promotion code.
     *
     * @remarks
     * This method is called from the subscription service and from a job scheduler's jobs.
     *
     * @param percentage - The percentage of the discount to apply
     * @param customerId - The id of the customer that can use the promotion code
     * @returns A promise resolving to the promotion code
     */
    public async createDiscountCouponAndPromotionCode(
        percentage: number,
        customerId: string
    ): Promise<string> {
        const coupon = await this.stripe.coupons.create({
            percent_off: percentage,
            max_redemptions: 1,
        });

        const promotionCode = await this.stripe.promotionCodes.create({
            coupon: coupon.id,
            customer: customerId,
            max_redemptions: 1,
        });

        return promotionCode.code;
    }

    /**
     * Creates a customer subscription to a membership plan.
     *
     * @remarks
     * This method is called from the subscription service.
     *
     * @param customerId - The id of the customer to create a subscription for
     * @param membership - The membership plan to subscribe to
     * @param [annual] - Whether to create an annual subscription
     * @param [trial] - Whether to create a trial
     * @param [promoCode] - The promotion code to apply
     */
    public async createMembershipSubscription(
        customerId: string,
        membership: MembershipSubscribeDetails,
        annual?: boolean,
        trial?: boolean,
        promoCode?: string
    ): Promise<void> {
        const promotionCode =
            promoCode &&
            (await this.stripe.promotionCodes.list({
                code: promoCode,
            }));

        await this.stripe.subscriptions.create({
            customer: customerId,
            currency: membership.currency,
            items: [
                {
                    price: annual
                        ? membership.stripeAnnualPriceId
                        : membership.stripeMonthlyPriceId,
                    quantity: 1,
                },
            ],
            off_session: true,
            proration_behavior: 'none',
            trial_period_days: membership.hasTrial && trial ? 30 : undefined,
            discounts: [
                {
                    promotion_code: promotionCode
                        ? promotionCode.data[0].id
                        : undefined,
                },
            ],
        });
    }

    /**
     * Cancels a stripe customer's subscription.
     *
     * @remarks
     * This method is called from the subscription service.
     *
     * @param userId - The customer's user ID
     * @param customerId - The id of the customer to cancel
     * @param immediate - Whether to cancel the subscription immediately
     *
     * @throws Error
     * Thrown if no subscriptions were found.
     *
     * @throws Error
     * Thrown if no invoice or invoice charge was found for the subscription.
     */
    public async cancelMembershipSubscriptionWithRefund(
        userId: number,
        customerId: string,
        immediate?: boolean
    ): Promise<void> {
        const subscriptions = await this.stripe.subscriptions.list({
            customer: customerId,
        });

        if (subscriptions.data.length === 0) {
            throw new Error('No subscriptions found to cancel');
        }

        if (!immediate) {
            await this.stripe.subscriptions.update(subscriptions.data[0].id, {
                cancel_at_period_end: true,
            });
            return;
        }

        if (
            subscriptions.data[0].trial_end &&
            subscriptions.data[0].trial_end * 1000 > Date.now()
        ) {
            await this.stripe.subscriptions.cancel(subscriptions.data[0].id);
            return;
        }

        const canceledSubscription = await this.stripe.subscriptions.cancel(
            subscriptions.data[0].id,
            { invoice_now: true, prorate: true }
        );

        if (!subscriptions.data[0].latest_invoice) return;

        const [latestInvoice, proratedInvoice] = await Promise.all([
            this.stripe.invoices.retrieve(
                subscriptions.data[0].latest_invoice.toString()
            ),
            this.stripe.invoices.retrieve(
                canceledSubscription.latest_invoice!.toString()
            ),
        ]);

        const creditAmount = Math.abs(proratedInvoice.total);

        if (!latestInvoice.charge) {
            await this.stripe.invoices.finalizeInvoice(
                canceledSubscription.latest_invoice!.toString()
            );

            return await this.notificationService!.sendNotification(
                userId,
                `Cannot refund subscription period. A credit amount of ${creditAmount / 100}€ was provided instead. Reason: A credited amount from the prior subscription's remaining period was used to activate this subscription.`
            );
        }

        const refundAmount =
            creditAmount > latestInvoice.amount_paid
                ? latestInvoice.amount_paid
                : creditAmount;

        await this.stripe.refunds.create({
            amount: refundAmount,
            charge: latestInvoice.charge.toString(),
        });

        await this.stripe.invoices.finalizeInvoice(
            canceledSubscription.latest_invoice!.toString()
        );
        const stripeCustomer = await this.stripe.customers.retrieve(customerId);

        if (!stripeCustomer.deleted) {
            await this.stripe.customers.update(customerId, {
                balance: stripeCustomer.balance + refundAmount,
            });
        }

        await this.notificationService!.sendNotification(
            userId,
            refundAmount === creditAmount
                ? `Refunded ${refundAmount / 100}€ for your remaining subscription period`
                : `Refunded only ${refundAmount / 100}€ from your subscription due to prorations`
        );
    }

    /**
     * Cancels membership subscription and credits unused time.
     *
     * @param customerId - The id of the customer to cancel
     */
    public async cancelMembershipSubscriptionWithProrate(
        customerId: string
    ): Promise<void> {
        const subscriptions = await this.stripe.subscriptions.list({
            customer: customerId,
        });

        if (subscriptions.data.length === 0) return;

        if (
            subscriptions.data[0].trial_end &&
            subscriptions.data[0].trial_end * 1000 > Date.now()
        ) {
            await this.stripe.subscriptions.cancel(subscriptions.data[0].id);
        } else {
            const subscription = await this.stripe.subscriptions.cancel(
                subscriptions.data[0].id,
                {
                    invoice_now: true,
                    prorate: true,
                }
            );

            await this.stripe.invoices.finalizeInvoice(
                subscription.latest_invoice!.toString()
            );
        }
    }

    /**
     * Handles payment processing for an order.
     *
     * @remarks
     * This method is also called from the replenishment service.
     *
     * @param userId - The id of the user to process payment for
     * @param data - The payment processing data
     * @returns A promise resolving to the weight range, payment intent id, and the payment amount
     */
    public async processPayment(
        userId: number,
        data: PaymentProcessingData
    ): Promise<ProcessedPaymentResponse> {
        const customer = await Customer.findOne({
            where: { userId },
        });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        if (data.safeShippingPaid && customer.membership !== 'free') {
            throw new Error(
                'You already have safe shipping enabled. No need to pay extra'
            );
        }

        if (data.loyaltyPoints && data.loyaltyPoints > customer.loyaltyPoints) {
            throw new Error(
                'Cannot pass more loyalty points than you have available'
            );
        }

        let itemIndex = 0;
        const productTotal: number = await Promise.all(
            data.orderItems.map(async (item) => {
                const product = await Product.findByPk(item.productId, {
                    attributes: ['price', 'discount'],
                });

                if (!product) {
                    throw new ProductNotFoundError(
                        `Product with id "${item.productId}" not found`
                    );
                }

                const itemPurchasePrice = product.discount
                    ? Math.ceil(
                          product.price -
                              (product.price * product.discount) / 100
                      ) - 0.01
                    : product.price;

                data.orderItems[itemIndex++].purchasePrice = itemPurchasePrice;
                return itemPurchasePrice * item.quantity;
            })
        ).then((prices) => prices.reduce((acc, price) => acc + price, 0));

        const {
            cost: shippingCost,
            weightCategory,
            orderWeight,
        } = await this.shippingService!.calculateShippingCost(
            data.shippingCountry,
            data.shippingMethod,
            undefined,
            data.orderItems,
            data.safeShippingPaid
        );

        let discountedPrice: number | null = null;
        if (data.loyaltyPoints) {
            discountedPrice = productTotal - data.loyaltyPoints / 10;
            customer.loyaltyPoints -= data.loyaltyPoints;
        }

        const totalAmount: number = parseFloat(
            ((discountedPrice ?? productTotal) + shippingCost).toFixed(2)
        );

        const paymentIntentId = await this.createPaymentIntent(
            userId,
            totalAmount,
            data.currency,
            data.paymentMethodId
        );

        switch (customer.membership) {
            case 'plus':
                customer.loyaltyPoints =
                    customer.loyaltyPoints + productTotal * 2;
                break;
            case 'premium':
                customer.loyaltyPoints =
                    customer.loyaltyPoints + productTotal * 3;
                break;
            default:
                customer.loyaltyPoints = customer.loyaltyPoints + productTotal;
        }

        await customer.save();

        return {
            mutatedOrderItems: data.orderItems,
            weightCategory,
            orderWeight,
            paymentIntentId,
            paymentAmount: totalAmount,
            safeShippingPaid: data.safeShippingPaid,
        };
    }

    /**
     * Processes a payment, audits new product purchases, and creates an order for a customer.
     *
     * @param userId - The customer's user ID
     * @param data - The payment processing data
     */
    public async processPaymentAndCreateOrder(
        userId: number,
        data: PaymentProcessingData
    ): Promise<void> {
        const paymentData = await this.processPayment(userId, data);

        const { ['id']: orderId } = await this.orderService!.createOrder(
            userId,
            data.orderItems,
            data.paymentMethodType,
            data.shippingCountry,
            paymentData.weightCategory,
            paymentData.orderWeight,
            data.shippingMethod,
            paymentData.paymentAmount,
            paymentData.paymentIntentId,
            paymentData.safeShippingPaid
        );

        paymentData.mutatedOrderItems.map(async (orderItem) => {
            for (let i = 0; i < orderItem.quantity; i++) {
                await Purchase.create({
                    orderId,
                    productId: orderItem.productId,
                    purchasePrice: orderItem.purchasePrice!,
                });
            }
        });
    }
}
