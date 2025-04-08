import { mongoose } from '../../config/mongodb';
const { Schema } = mongoose;
import Rating, { IRating } from './Rating.model';

export interface IPlatformRating extends IRating {
    numberOfPurchases?: number;
    mostPurchasesCategory?: string;
    featureHighlights: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const platformRatingSchema = new Schema<IPlatformRating>(
    {
        numberOfPurchases: { type: Number, default: 0, required: false },
        mostPurchasesCategory: { type: String, default: '', required: false },
        featureHighlights: { type: String, required: false },
    },
    { timestamps: true }
);

const PlatformRating = Rating.discriminator<IPlatformRating>(
    'PlatformRating',
    platformRatingSchema
);

export default PlatformRating;
