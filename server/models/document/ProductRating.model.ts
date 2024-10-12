import { mongoose } from '../../config/mongodb';
const { Schema } = mongoose;
import Rating, { IRating } from './Rating.model';

export interface IProductRating extends IRating {
    productId: number;
    productHighlights?: string;
    alternatives?: Array<string>;
}

const productRatingSchema = new Schema<IProductRating>({
    productId: { type: Number, required: true },
    productHighlights: { type: String, required: false },
    alternatives: { type: [String], required: false },
});

const ProductRating = Rating.discriminator<IProductRating>(
    'ProductRating',
    productRatingSchema
);

export default ProductRating;
