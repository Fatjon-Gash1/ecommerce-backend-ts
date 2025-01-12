import { Membership } from '../models/document';
import { PaymentService } from './Payment.service';
import { Customer } from '../models/relational';
import { UserNotFoundError } from '../errors';

interface MembershipBaseDetails {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    stripeProductId?: string;
    stripeMonthlyPriceId?: string;
    stripeAnnualPriceId?: string;
}

interface MembershipAdditionalDetails {
    features: MembershipFeatures[];
    discountable: boolean;
    hasTrial: boolean;
}

interface MembershipFullDetails
    extends MembershipBaseDetails,
        MembershipAdditionalDetails {}

interface MembershipResponse {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    features: MembershipFeatures[];
    discountable: boolean;
    hasTrial: boolean;
    updatedAt?: Date;
}

enum MembershipFeatures {
    Replenishment,
    secondFeature,
    thirdFeature,
}

/**
 * Service related to platform subscriptions
 */
export class SubscriptionService {
    protected paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Creates a new membership subscription.
     *
     * @remarks This method is tightly coupled with the membership subscription type.
     * Indicating that any changes to the type must align with the method logic and vice versa.
     *
     * @param userId - The customer's user id
     * @param promoCode - The discount coupon promotion code
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the customer does not exist.
     */
    public async createMembershipSubscription(
        userId: number,
        promoCode?: string
    ): Promise<void> {
        const [customer, membership] = await Promise.all([
            Customer.findOne({ where: { userId } }),
            Membership.findOne({ where: { name: 'Membership' } }),
        ]);

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        await this.paymentService.createMembershipSubscription(
            customer.stripeId!,
            membership!,
            promoCode
        );
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
     * Updates a membership subscription type.
     *
     * @param membershipId - The membership id
     * @param details - The membership details
     * @returns A promise resolving to the updated membership
     */
    public async updateMembershipById(
        membershipId: string,
        name: string,
        monthlyPrice: number,
        annualPrice: number,
        currency: string,
        otherDetails: MembershipAdditionalDetails
    ): Promise<MembershipResponse> {
        const updateDetails: MembershipFullDetails = {
            name,
            monthlyPrice,
            annualPrice,
            currency,
            ...otherDetails,
        };

        const membership = await Membership.findById(membershipId);

        const { monthlyPriceId, annualPriceId } =
            await this.paymentService.updateProduct(
                membership!.stripeProductId,
                name,
                monthlyPrice,
                annualPrice,
                currency
            );

        if (monthlyPriceId) {
            updateDetails.stripeMonthlyPriceId = monthlyPriceId;
        }

        if (annualPriceId) {
            updateDetails.stripeAnnualPriceId = annualPriceId;
        }

        const updatedMembership = await Membership.findByIdAndUpdate(
            membershipId,
            updateDetails,
            { new: true }
        );

        return updatedMembership!.toObject();
    }
}
