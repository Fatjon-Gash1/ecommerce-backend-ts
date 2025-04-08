export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export interface NewProduct {
    name: string;
    price: number;
    discount?: number;
    imageUrl: string;
}

export type Promotion = 'newArrival' | 'discount';

export interface PromotionData {
    file: string;
    shopRoute: string;
    subject: string;
}

export interface HandledRefundEmailData {
    status: 'approved' | 'denied';
    orderTrackingNumber: string;
    orderTotal: string;
    refundAmount: string | null;
    rejectionReason?: string;
}

export interface SuccessfulPaymentEmailData {
    customerName: string;
    orderTrackingNumber: string;
    deliveryDate: string;
    paymentAmount: string;
    deliveryAddress: string;
    subscriptionStateInfo: string;
    manageSubscriptionLink: string;
    customerSupportEmail: string;
    customerSupportPhoneNumber: string;
}

export interface FailedPaymentEmailData {
    manageSubscriptionLink: string;
    customerSupportEmail: string;
    customerSupportPhoneNumber: string;
}
