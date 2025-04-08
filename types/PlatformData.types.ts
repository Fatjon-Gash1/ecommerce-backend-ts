export interface PlatformDataObject {
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

export interface PlatformDataResponse extends PlatformDataObject {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
