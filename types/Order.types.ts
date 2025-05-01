export interface OrderItemAttributes {
    productId: number;
    quantity: number;
}

export interface OrderResponse {
    id: number;
    customerId: number;
    paymentMethod: 'card' | 'wallet' | 'bank-transfer';
    shippingCountry: string;
    weightCategory:
        | 'light'
        | 'standard'
        | 'heavy'
        | 'very-heavy'
        | 'extra-heavy';
    shippingMethod: 'standard' | 'express' | 'next-day';
    status:
        | 'pending'
        | 'shipped'
        | 'awaiting pickup'
        | 'delivered'
        | 'refunded'
        | 'partially-refunded'
        | 'uncollected';
    trackingNumber: string;
    total: number;
    rating?: number;
    proofOfDeliveryImageUrl?: string;
    safeShipping: boolean;
    createdAt?: Date;
}

export interface OrderItemResponse {
    id?: number;
    name: string;
    description: string;
    imageUrl: string;
    weight: number;
    price: number;
    quantity?: number;
}
