import { mongoose } from '../../config/db';
const { Schema, model } = mongoose;

export interface IMembership {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    stripeProductId: string;
    stripeMonthlyPriceId: string;
    stripeAnnualPriceId: string;
    features: MembershipFeatures[];
    discountable: boolean;
    hasTrial: boolean;
}

enum MembershipFeatures {
    Replenishment,
    secondFeature,
    thirdFeature,
}

const membershipSchema = new Schema<IMembership>(
    {
        name: { type: String, required: true },
        monthlyPrice: { type: Number, required: true },
        annualPrice: { type: Number, required: true },
        currency: { type: String, required: true },
        stripeProductId: { type: String, required: true },
        stripeMonthlyPriceId: { type: String, required: true },
        stripeAnnualPriceId: { type: String, required: true },
        features: { type: [String], required: true },
        discountable: { type: Boolean, required: true },
        hasTrial: { type: Boolean, required: true },
    },
    { timestamps: true }
);

const Membership = model<IMembership>('Membership', membershipSchema);

export default Membership;
