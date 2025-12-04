import { mongoose } from '@/config/db';
const { Schema, model } = mongoose;

export interface IMembership {
    type: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    stripeProductId: string;
    stripeMonthlyPriceId: string;
    stripeAnnualPriceId: string;
    features: string[];
    hasTrial: boolean;
    discounted: boolean;
    discountData: DiscountData;
}

interface DiscountData {
    pricePlan: 'annual' | 'monthly';
    oldPrice: number;
    newPrice: number;
}

const membershipSchema = new Schema<IMembership>(
    {
        type: { type: String, required: true },
        monthlyPrice: { type: Number, required: true },
        annualPrice: { type: Number, required: true },
        currency: { type: String, required: true },
        stripeProductId: { type: String, required: true },
        stripeMonthlyPriceId: { type: String, required: true },
        stripeAnnualPriceId: { type: String, required: true },
        features: { type: [String], required: true },
        hasTrial: { type: Boolean, required: false },
        discounted: { type: Boolean, required: false },
        discountData: { type: Object, required: false },
    },
    { timestamps: true }
);

const Membership = model<IMembership>('Membership', membershipSchema);

export default Membership;
