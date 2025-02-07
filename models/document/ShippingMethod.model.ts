import { mongoose } from '../../config/mongodb';
const { Schema, model } = mongoose;

export interface IShippingMethod {
    method: 'standard' | 'express' | 'next-day';
    rate: number;
}

const shippingMethodSchema = new Schema<IShippingMethod>({
    method: {
        type: String,
        enum: ['standard', 'express', 'next-day'],
        required: true,
    },
    rate: { type: Number, required: true },
});

const ShippingMethod = model<IShippingMethod>(
    'ShippingMethod',
    shippingMethodSchema
);

export default ShippingMethod;
