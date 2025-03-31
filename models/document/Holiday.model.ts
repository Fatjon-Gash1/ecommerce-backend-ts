import { mongoose } from '@/config/db';
const { Schema, model } = mongoose;

export interface IHoliday {
    schedulerId: string;
    name: string;
    date: string;
    promotion: PromotionData;
}

interface PromotionData {
    loyaltyPoints: number;
    promoCode: boolean;
    percentOff?: number;
}

const membershipSchema = new Schema<IHoliday>(
    {
        schedulerId: { type: String, required: true },
        name: { type: String, required: true },
        date: { type: String, required: true },
        promotion: { type: Object, required: true },
    },
    { timestamps: true }
);

const Holiday = model<IHoliday>('Holiday', membershipSchema);

export default Holiday;
