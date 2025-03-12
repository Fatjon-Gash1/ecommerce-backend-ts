import { redisClient } from '@/config/redis';
import { queue1 } from '@/jobQueues';
import pLimit from 'p-limit';
import { PaymentService } from '../Payment.service';
import { NotificationService } from '../Notification.service';
import { Customer } from '@/models/relational';
import { Membership } from '@/models/document';
import { UserNotFoundError } from '@/errors';

interface MembershipResponse {
    type: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    features: string[];
    hasTrial: boolean;
    updatedAt?: Date;
}

interface MembershipSubscriptionResponse {
    type: string;
    plan: string;
    price: number | null;
    status: 'active' | 'canceled';
    created: Date;
}

type Membership = 'plus' | 'premium';

interface MembershipSubscriptionFilters {
    type?: 'free' | Membership;
    plan?: 'annual' | 'monthly';
    status?: 'active' | 'canceled';
}

/**
 * Service related to platform subscriptions
 */
export class SubscriptionService {
    protected paymentService?: PaymentService;
    protected notificationService?: NotificationService;

    constructor(
        paymentService?: PaymentService,
        notificationService?: NotificationService
    ) {
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    /**
     * Creates a new membership subscription.
     *
     * @remarks This method is tightly coupled with the membership subscription type.
     * Indicating that any changes to the type must align with the method logic and vice versa.
     *
     * @param userId - The customer's user id
     * @param membershipType - The type of the membership
     * @param [annual] - Whether to create an annual subscription
     * @param [promoCode] - The discount coupon promotion code
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the customer does not exist.
     */
    public async createMembershipSubscription(
        userId: number,
        membershipType: 'plus' | 'premium',
        annual?: boolean,
        promoCode?: string
    ): Promise<void> {
        const [customer, membership] = await Promise.all([
            Customer.findOne({ where: { userId } }),
            Membership.findOne({ type: membershipType }).select(
                '-__t -__v -_id'
            ),
        ]);

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const actualSubscription =
            await this.paymentService!.getCustomerSubscription(
                customer.stripeId
            );
        const canceledSubscriptions =
            await this.paymentService!.hasCanceledSubscriptions(
                customer.stripeId
            );

        if (actualSubscription) {
            const newPlan = annual ? 'year' : 'month';
            if (
                membershipType === customer.membership &&
                actualSubscription.plan === newPlan
            ) {
                throw new Error('Cannot subscribe to the same membership plan');
            }

            await this.paymentService!.cancelMembershipSubscriptionWithProrate(
                customer.stripeId
            );
            await this.paymentService!.createMembershipSubscription(
                customer.stripeId,
                membership!.toObject(),
                annual,
                false,
                promoCode
            );
        } else if (canceledSubscriptions) {
            await this.paymentService!.createMembershipSubscription(
                customer.stripeId,
                membership!.toObject(),
                annual,
                false,
                promoCode
            );
        } else {
            await this.paymentService!.createMembershipSubscription(
                customer.stripeId,
                membership!.toObject(),
                annual,
                true,
                promoCode
            );
        }

        if (customer.membership !== membershipType) {
            customer.membership = membershipType;
            await customer.save();
        }
    }

    /**
     * Cancels a customer's membership subscription.
     *
     * @param userId - The customer's user id
     * @param immediate - Whether to cancel the subscription immediately
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the customer does not exist.
     */
    public async cancelMembershipSubscription(
        userId: number,
        immediate?: boolean
    ): Promise<void> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        await this.paymentService!.cancelMembershipSubscriptionWithRefund(
            customer.userId,
            customer.stripeId,
            immediate
        );

        customer.membership = 'free';
        await customer.save();
    }

    /**
     * Retrieves the membership subscription type.
     *
     * @returns A promise resolving to the membership subscription type
     */
    public async getMemberships(): Promise<MembershipResponse[]> {
        const memberships = await Membership.find();

        return memberships!.map((item) => item.toObject());
    }

    /**
     * Retrieves membership subscriptions based on filtering parameters. If none passed it returns all subscriptions.
     *
     * @param [filters] - Optional filtering parameters
     * @returns A promise resolving to all membership subscriptions
     */
    public async getMembershipSubscriptions(
        filters?: MembershipSubscriptionFilters
    ): Promise<{
        total: number;
        subscriptions: MembershipSubscriptionResponse[];
    }> {
        const limit = pLimit(10);
        const customers = await Customer.findAll();

        const subscriptionDataPromises = customers.map((customer) =>
            limit(async () => {
                const subscription =
                    await this.paymentService!.getCustomerSubscription(
                        customer.stripeId
                    );

                if (!subscription) {
                    return null;
                }

                return {
                    type: customer.membership,
                    plan: subscription.plan === 'year' ? 'annual' : 'monthly',
                    price: subscription.price,
                    status: subscription.status,
                    created: subscription.created,
                };
            })
        );
        const subscriptionData = await Promise.all(subscriptionDataPromises);

        const cleanedSubscriptionData = subscriptionData.filter(
            (subscription) => subscription !== null
        );

        if (filters) {
            let filteredData = cleanedSubscriptionData;
            for (const field in filters) {
                filteredData = filteredData.filter(
                    (subscription) =>
                        subscription[field as keyof typeof filters] ===
                        filters[field as keyof typeof filters]
                );
            }
            return {
                total: filteredData.length,
                subscriptions: filteredData,
            };
        }
        return {
            total: cleanedSubscriptionData.length,
            subscriptions: cleanedSubscriptionData,
        };
    }

    /**
     * Changes a membership's price.
     *
     * @remarks
     * This method creates new subscriptions to the changed price for subscribed customers automatically if the price is less than the old one (Discounted).
     * If the price is higher, it sends a confirmation email to subscribed customers.
     * In this scenario, the subscription is created on confirmation.
     * If no action is taken from the customer, the customer's membership is canceled after the end of the period.
     *
     * @param membershipId - The membership's id
     * @param pricePlan - The type of the price (Annual or Monthly)
     * @param price - The price of the membership
     */
    public async changeMembershipPrice(
        membershipId: string,
        pricePlan: 'annual' | 'monthly',
        price: number
    ): Promise<void> {
        const limit = pLimit(100);
        const membership = await Membership.findById(membershipId);
        const oldPrice =
            pricePlan === 'annual'
                ? membership!.annualPrice
                : membership!.monthlyPrice;
        membership![`${pricePlan}Price`] = price;

        const subscriptionData =
            await this.paymentService!.retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions(
                pricePlan === 'annual'
                    ? membership!.stripeAnnualPriceId
                    : membership!.stripeMonthlyPriceId
            );

        const newPriceId = await this.paymentService!.updateMembership(
            membership!.stripeProductId,
            pricePlan,
            price
        );

        if (price <= oldPrice) {
            await this.paymentService!.createSubscriptionsForCustomers(
                subscriptionData,
                newPriceId
            );
            membership!.discounted = true;
            membership!.discountData = { pricePlan, oldPrice, newPrice: price };

            await this.notificationService!.sendMembershipDiscountEmailToNonSubscribers(
                membership!.type,
                pricePlan,
                oldPrice,
                price
            );

            const customers = await Customer.findAll({
                where: { membership: membership!.type },
                attributes: ['userId'],
            });

            const discountNotificationPromises = customers.map((customer) =>
                limit(() =>
                    this.notificationService!.sendNotification(
                        customer.userId,
                        `Your current ${membership!.type} membership has been discounted from €${oldPrice} to €${price}.`
                    )
                )
            );

            await Promise.allSettled(discountNotificationPromises);
        } else {
            const jobPromises = Array.from(subscriptionData.entries()).map(
                ([customerId, endOfPeriod]) =>
                    limit(() =>
                        queue1
                            .add(
                                'MCJ',
                                {
                                    stripeCustomerId: customerId,
                                    membershipType: membership!.type,
                                },
                                { delay: endOfPeriod - Date.now() }
                            )
                            .then((job) => {
                                if (job.id) {
                                    return redisClient.hset(
                                        'MCJRecord',
                                        customerId,
                                        job.id
                                    );
                                }
                            })
                    )
            );

            await Promise.allSettled(jobPromises);

            await this.notificationService!.sendEmailOnMembershipPriceIncrease(
                subscriptionData,
                membership!.type,
                oldPrice,
                price
            );
        }

        await membership!.save();
    }

    /**
     * Cancels a customer's membership.
     *
     * @remarks
     * This method is called automatically from scheduled jobs.
     *
     * @param stripeCustomerId - The customer's stripe id
     */
    public async cancelMembership(stripeCustomerId: number): Promise<number> {
        const customer = await Customer.findOne({
            where: { stripeId: stripeCustomerId },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        customer.membership = 'free';
        await customer.save();

        return customer.userId;
    }
}
