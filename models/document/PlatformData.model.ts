import { mongoose } from '../../config/db';
const { Schema, model } = mongoose;

interface IPlatformData {
    companyName: string;
    headquartersAddress: string;
    customerSupportEmail: string;
    customerSupportPhoneNumber: string;
    operatingHours: string;
    faq: Faq[];
}

interface Faq {
    question: string;
    answer: string;
}

const platformDataSchema = new Schema<IPlatformData>(
    {
        companyName: { type: String, required: true },
        headquartersAddress: { type: String },
        customerSupportEmail: { type: String, required: true },
        customerSupportPhoneNumber: { type: String, required: true },
        operatingHours: { type: String, required: true },
        faq: { type: [{ question: String, answer: String }] },
    },
    { timestamps: true }
);

const PlatformData = model<IPlatformData>('PlatformData', platformDataSchema);

export default PlatformData;
