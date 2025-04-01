import { mongoose } from '@/config/db';
const { Schema, model } = mongoose;

interface IPlatformLog {
    action: string;
    message: string;
}

const platformDataSchema = new Schema<IPlatformLog>(
    {
        action: { type: String, required: true },
        message: { type: String, required: true },
    },
    { timestamps: true }
);

const PlatformLog = model<IPlatformLog>('PlatformLog', platformDataSchema);

export default PlatformLog;
