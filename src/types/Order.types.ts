import type { Transaction } from 'sequelize';

export interface OrderCreationData {
    userId: number;
    items: OrderItemAttributes[];
    paymentMethod: 'card';
    shippingCountry: string;
    weightCategory:
        | 'light'
        | 'standard'
        | 'heavy'
        | 'very-heavy'
        | 'extra-heavy';
    orderWeight: number;
    shippingMethod: 'standard' | 'express' | 'next-day';
    orderTotal: number;
    paymentIntentId: string;
    safeShippingPaid?: boolean;
    transactionObj?: Transaction;
}

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
        | 'awaiting-pickup'
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
    imageUrls: string[];
    weight: number;
    price: number;
    quantity?: number;
}
