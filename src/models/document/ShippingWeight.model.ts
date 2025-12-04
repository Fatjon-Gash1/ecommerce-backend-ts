import { mongoose } from '../../config/mongodb';
const { Schema, model } = mongoose;

export interface IShippingWeight {
    weight: 'light' | 'standard' | 'heavy';
    rate: number;
}

const shippingWeightSchema = new Schema<IShippingWeight>({
    weight: {
        type: String,
        enum: ['light', 'standard', 'heavy'],
        required: true,
    },
    rate: { type: Number, required: true },
});

const ShippingWeight = model<IShippingWeight>(
    'ShippingWeight',
    shippingWeightSchema
);

export default ShippingWeight;
