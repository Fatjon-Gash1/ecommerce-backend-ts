import { mongoose } from '../../config/db';
const { Schema, model } = mongoose;

interface IRating extends Document {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    userProfession?: string;
    rating: number;
    review: string;
    date?: Date;
}

const ratingSchema = new Schema<IRating>({
    userId: { type: Number, required: true },
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userProfession: { type: String, required: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

const Rating = model<IRating>('Rating', ratingSchema);

export default Rating;
