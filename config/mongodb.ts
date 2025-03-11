import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from '@/services/Logger.service';

function connectToMongoDB(): void {
    mongoose
        .connect(process.env.MONGODB_URI as string, {} as ConnectOptions)
        .then(() => logger.log('Connected to MongoDB'))
        .catch((err: Error) => {
            logger.error('MongoDB connection error:' + err);
            process.exit(1);
        });
}

export { mongoose, connectToMongoDB };
