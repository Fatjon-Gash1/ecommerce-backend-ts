import mongoose, { ConnectOptions } from 'mongoose';

function connectToMongoDB(): void {
    mongoose
        .connect(process.env.MONGODB_URI as string, {} as ConnectOptions)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err: Error) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
}

export { mongoose, connectToMongoDB };
