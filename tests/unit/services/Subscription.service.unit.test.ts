import { redisClient } from '@/config/redis';
import { UserNotFoundError } from '@/errors';
import { Membership } from '@/models/document';
import { IMembership } from '@/models/document/Membership.model';
import { Customer } from '@/models/relational';
import {
    NotificationService,
    PaymentService,
    SubscriptionService,
} from '@/services';
import { MembershipSubscribeDetails } from '@/types';
import type { Document, Types } from 'mongoose';

class TestableSubscriptionService extends SubscriptionService {
    public exposedPaymentService = this.paymentService;
    public exposedNotificationService = this.notificationService;
}

describe('SubscriptionService', () => {
    const subscriptionService = new TestableSubscriptionService(
        new PaymentService('abc'),
        new NotificationService()
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createMembershipSubscription', () => {
        let mockCustomer = {
            stripeId: 1,
            membership: 'plus',
            save: jest.fn(),
        };
        const membershipData: MembershipSubscribeDetails = {
            currency: 'USD',
            stripeMonthlyPriceId: '123',
            stripeAnnualPriceId: '456',
            hasTrial: false,
        };
        let mockMembership: Partial<
            | (Document<unknown, unknown, IMembership> &
                  IMembership & { _id: Types.ObjectId } & { __v: number })
            | null
        >;

        beforeEach(() => {
            (Membership.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue(mockMembership),
            });
            mockMembership = {
                toObject: jest.fn().mockReturnValue(membershipData),
            };
            mockCustomer = {
                ...mockCustomer,
                membership: 'plus',
            };
        });

        it('should throw UserNotFoundError if the customer does not exist', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                subscriptionService.createMembershipSubscription(1, 'plus')
            ).rejects.toThrow(UserNotFoundError);

            expect(
                subscriptionService.exposedPaymentService!
                    .getCustomerSubscription
            ).not.toHaveBeenCalled();
        });

        it('should throw generic error if the same membership is already active', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(mockCustomer);
            (
                subscriptionService.exposedPaymentService!
                    .getCustomerSubscription as jest.Mock
            ).mockResolvedValue({ plan: 'month' });
            (
                subscriptionService.exposedPaymentService!
                    .hasCanceledSubscriptions as jest.Mock
            ).mockResolvedValue({ plan: 'annual' });

            await expect(
                subscriptionService.createMembershipSubscription(1, 'plus')
            ).rejects.toThrow('Cannot subscribe to the same membership plan');

            expect(
                subscriptionService.exposedPaymentService!
                    .cancelMembershipSubscriptionWithProrate
            ).not.toHaveBeenCalled();
        });

        it('should cancel existing subscription and create a new one', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(mockCustomer);
            (
                subscriptionService.exposedPaymentService!
                    .getCustomerSubscription as jest.Mock
            ).mockResolvedValue({ plan: 'month' });
            (
                subscriptionService.exposedPaymentService!
                    .hasCanceledSubscriptions as jest.Mock
            ).mockResolvedValue({ plan: 'annual' });

            await subscriptionService.createMembershipSubscription(
                1,
                'premium'
            );

            expect(
                subscriptionService.exposedPaymentService!
                    .cancelMembershipSubscriptionWithProrate
            ).toHaveBeenCalled();
            expect(
                subscriptionService.exposedPaymentService!
                    .createMembershipSubscription
            ).toHaveBeenCalled();
            expect(mockCustomer.save).toHaveBeenCalled();
        });

        it('should create a new subscription without trial', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(mockCustomer);
            (
                subscriptionService.exposedPaymentService!
                    .getCustomerSubscription as jest.Mock
            ).mockResolvedValue(null);
            (
                subscriptionService.exposedPaymentService!
                    .hasCanceledSubscriptions as jest.Mock
            ).mockResolvedValue({ plan: 'annual' });

            await subscriptionService.createMembershipSubscription(
                1,
                'premium'
            );

            expect(
                subscriptionService.exposedPaymentService!
                    .cancelMembershipSubscriptionWithProrate
            ).not.toHaveBeenCalled();
            expect(
                subscriptionService.exposedPaymentService!
                    .createMembershipSubscription
            ).toHaveBeenCalledWith(
                mockCustomer.stripeId,
                mockMembership!.toObject?.(),
                undefined,
                false,
                undefined
            );
            expect(mockCustomer.save).toHaveBeenCalled();
        });

        it('should create a new subscription with trial', async () => {
            (Customer.findOne as jest.Mock).mockResolvedValue(mockCustomer);
            (
                subscriptionService.exposedPaymentService!
                    .getCustomerSubscription as jest.Mock
            ).mockResolvedValue(null);
            (
                subscriptionService.exposedPaymentService!
                    .hasCanceledSubscriptions as jest.Mock
            ).mockResolvedValue(null);

            await subscriptionService.createMembershipSubscription(
                1,
                'premium'
            );

            expect(
                subscriptionService.exposedPaymentService!
                    .cancelMembershipSubscriptionWithProrate
            ).not.toHaveBeenCalled();
            expect(
                subscriptionService.exposedPaymentService!
                    .createMembershipSubscription
            ).toHaveBeenCalledWith(
                mockCustomer.stripeId,
                mockMembership!.toObject?.(),
                undefined,
                true,
                undefined
            );
            expect(mockCustomer.save).toHaveBeenCalled();
        });
    });

    describe('changeMembershipPrice', () => {
        const membershipData = {
            currency: 'USD',
            stripeMonthlyPriceId: '123',
            stripeAnnualPriceId: '456',
            annualPrice: 120.99,
            monthlyPrice: 9.99,
            hasTrial: false,
            stripeProductId: '789',
        };
        let mockMembership: Partial<
            | (Document<unknown, unknown, IMembership> &
                  IMembership & { _id: Types.ObjectId } & { __v: number })
            | null
        >;

        beforeEach(() => {
            mockMembership = {
                //toObject: jest.fn().mockReturnValue(membershipData),
                ...membershipData,
                save: jest.fn(),
            };
            (Membership.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue(mockMembership),
            });
            (Membership.findById as jest.Mock).mockResolvedValue(
                mockMembership
            );
        });

        it('should throw generic error if new price is the same as old one', async () => {
            await expect(
                subscriptionService.changeMembershipPrice(
                    '123',
                    'annual',
                    120.99
                )
            ).rejects.toThrow('New price cannot be the same as the old one');
            expect(
                subscriptionService.exposedPaymentService!
                    .retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions
            ).not.toHaveBeenCalled();
        });

        it('should deduct membership price for all memberships', async () => {
            (
                subscriptionService.exposedPaymentService!
                    .updateMembership as jest.Mock
            ).mockResolvedValue('123');
            (
                subscriptionService.exposedPaymentService!
                    .retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions as jest.Mock
            ).mockResolvedValue(new Map([['123', 1]]));
            (Customer.findAll as jest.Mock).mockResolvedValue([
                { id: 1 },
                { id: 2 },
            ]);

            await subscriptionService.changeMembershipPrice(
                '123',
                'annual',
                99.99
            );

            expect(
                subscriptionService.exposedPaymentService!
                    .retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions
            ).toHaveBeenCalled();
            expect(
                subscriptionService.exposedPaymentService!.updateMembership
            ).toHaveBeenCalledWith(
                mockMembership!.stripeProductId,
                'annual',
                99.99
            );
            expect(
                subscriptionService.exposedPaymentService!
                    .createSubscriptionsForCustomers
            ).toHaveBeenCalled();
            expect(
                subscriptionService.exposedNotificationService!
                    .sendMembershipDiscountEmailToNonSubscribers
            ).toHaveBeenCalled();
            expect(
                (
                    subscriptionService.exposedNotificationService!
                        .sendNotification as jest.Mock
                ).mock.calls.length
            ).toBe(2);
            expect(mockMembership!.save).toHaveBeenCalled();
        });

        it('should increase membership price for all memberships', async () => {
            (
                subscriptionService.exposedPaymentService!
                    .updateMembership as jest.Mock
            ).mockResolvedValue('123');
            (
                subscriptionService.exposedPaymentService!
                    .retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions as jest.Mock
            ).mockResolvedValue(new Map([['123', 123]]));
            (redisClient.hexists as jest.Mock).mockResolvedValue(1);

            await subscriptionService.changeMembershipPrice(
                '123',
                'annual',
                199.99
            );

            expect(
                subscriptionService.exposedPaymentService!
                    .retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions
            ).toHaveBeenCalled();
            expect(
                subscriptionService.exposedPaymentService!.updateMembership
            ).toHaveBeenCalledWith(
                mockMembership!.stripeProductId,
                'annual',
                199.99
            );
            expect(
                subscriptionService.exposedPaymentService!
                    .createSubscriptionsForCustomers
            ).not.toHaveBeenCalled();
            expect(
                subscriptionService.exposedNotificationService!
                    .sendEmailOnMembershipPriceIncrease
            ).toHaveBeenCalled();
            expect(mockMembership!.save).toHaveBeenCalled();
        });
    });
});
