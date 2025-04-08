export interface MembershipResponse {
    type: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    features: string[];
    hasTrial: boolean;
    updatedAt?: Date;
}

export interface MembershipSubscriptionResponse {
    type: string;
    plan: string;
    price: number | null;
    status: 'active' | 'canceled';
    created: Date;
}

export type Membership = 'plus' | 'premium';

export interface MembershipSubscriptionFilters {
    type?: 'free' | Membership;
    plan?: 'annual' | 'monthly';
    status?: 'active' | 'canceled';
}

interface OrderData {
    userId: number;
    orderItems: OrderItem[];
    paymentMethod: 'card' | 'wallet' | 'bank-transfer';
    shippingCountry: string;
}

interface OrderItem {
    productId: number;
    quantity: number;
}

export interface ReplenishmentData extends OrderData {
    paymentMethodId: string;
    currency: 'usd' | 'eur';
}

export interface Units {
    day: number;
    week: number;
    month: number;
    year: number;
    custom: number;
}

export interface ReplenishmentCreateData {
    schedulerId: string;
    customerId: number;
    unit: Unit;
    interval: number;
    startDate: string;
    endDate?: string;
    times?: number;
    status: Status;
}

export interface ReplenishmentUpdateData {
    unit: Unit;
    interval: number;
    startDate?: string;
    endDate?: string;
    times?: number;
    executions?: number;
    status?: Status;
    nextPaymentDate?: string | null;
}

export interface ReplenishmentResponse {
    id?: number;
    startDate: string;
    lastPaymentDate?: string | null;
    nextPaymentDate?: string | null;
    endDate?: string;
    times?: number;
    unit: Unit;
    interval: number;
    orderId?: number;
    replenishmentPayment?: { paymentDate: string };
}

export interface ReplenishmentFilters {
    customerId?: number;
    unit?: Unit;
    interval?: number;
    status?: Status;
}

export type Unit = 'day' | 'week' | 'month' | 'year' | 'custom';

export type Status =
    | 'scheduled'
    | 'active'
    | 'finished'
    | 'canceled'
    | 'failed';
