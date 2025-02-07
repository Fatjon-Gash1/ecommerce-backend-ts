import { mongoose } from '../../config/mongodb';
const { Schema, model } = mongoose;

interface IProductAnalytic {
    productId: number;
    purchases: number;
    reviews: number;
    averageRating: number;
    date?: Date;
}

const productAnalyticSchema = new Schema<IProductAnalytic>({
    productId: { type: Number, required: true },
    purchases: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
});

const ProductAnalytic = model<IProductAnalytic>(
    'ProductAnalytic',
    productAnalyticSchema
);

export default ProductAnalytic;
