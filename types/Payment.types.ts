export interface PaymentMethodResponse {
    id: string;
    type: string;
    card?: CardPaymentMethod;
    created: number;
}

interface CardPaymentMethod {
    brand?: string;
    country?: string | null;
    exp_month?: number;
    exp_year?: number;
    funding?: string;
    last4?: string;
}

export interface SetupIntentResponse {
    customer: string;
    payment_method: string;
}

export interface MembershipSubscribeDetails {
    currency: string;
    stripeMonthlyPriceId: string;
    stripeAnnualPriceId: string;
    hasTrial: boolean;
}

export interface PaymentProductDetails {
    name: string;
    currency: string;
    price: number;
}

export interface PaymentProcessingData {
    orderItems: OrderItem[];
    shippingCountry: string;
    shippingMethod: 'standard' | 'express' | 'next-day';
    currency: 'usd' | 'eur';
    paymentMethodType: 'card';
    paymentMethodId: string;
    loyaltyPoints?: number;
    safeShippingPaid?: boolean;
}

export interface OrderItem {
    productId: number;
    quantity: number;
    purchasePrice?: number;
}

export interface RefundRequestResponse {
    id: number;
    customerId: number;
    orderId: number;
    reason: string;
    amount: number | null;
    status: 'pending' | 'approved' | 'denied';
    createdAt: Date;
}

export interface SubscriptionFormattedResponse {
    plan: string;
    price: number | null;
    status: 'active' | 'canceled';
    created: Date;
}

export interface ProcessedPaymentResponse {
    mutatedOrderItems: OrderItem[];
    weightCategory:
        | 'light'
        | 'standard'
        | 'heavy'
        | 'very-heavy'
        | 'extra-heavy';
    orderWeight: number;
    paymentIntentId: string;
    paymentAmount: number;
    safeShippingPaid?: boolean;
}
