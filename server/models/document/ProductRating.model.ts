import { mongoose } from '../../config/mongodb';
const { Schema } = mongoose;
import Rating, { IRating } from './Rating.model';

export interface IProductReview extends IRating {
    productId: number;
    productHighlights: string;
    alternatives: Array<string>;
}

const productReviewSchema = new Schema<IProductReview>({
    productId: { type: Number, required: true },
    productHighlights: { type: String, required: false },
    alternatives: { type: [String], required: false },
});

const ProductReview = Rating.discriminator<IProductReview>(
    'ProductReview',
    productReviewSchema
);

export default ProductReview;
