import { mongoose } from '../../config/mongodb';
const { Schema } = mongoose;
import Rating, { IRating } from './Rating.model';

export interface IProductRating extends IRating {
    productId: number;
    productHighlights?: string;
    alternatives?: Array<number>;
    createdAt?: Date;
    updatedAt?: Date;
}

const productRatingSchema = new Schema<IProductRating>({
    productId: { type: Number, required: true },
    productHighlights: { type: String, required: false },
    alternatives: { type: [Number], required: false },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
});

const ProductRating = Rating.discriminator<IProductRating>(
    'ProductRating',
    productRatingSchema
);

export default ProductRating;
