import { mongoose } from '@/config/db';
const { Schema, model } = mongoose;

interface IPlatformLog {
    type: string;
    message: string;
    createdAt: Date;
}

const platformDataSchema = new Schema<IPlatformLog>(
    {
        type: { type: String, required: true },
        message: { type: String, required: true },
    },
    { timestamps: true }
);

const PlatformLog = model<IPlatformLog>('PlatformLog', platformDataSchema);

export default PlatformLog;
