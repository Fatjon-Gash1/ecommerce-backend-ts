export interface UserDetails {
    profilePictureUrl?: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    isActive?: boolean;
    lastLogin?: Date | string;
    role?: string;
    birthday?: Date;
    createdAt?: Date;
}

export interface UserCreationDetails extends UserDetails {
    password: string;
}

export interface CustomerDetails {
    shippingAddress: string;
    billingAddress: string;
}

export interface AuthTokens {
    refreshToken: string;
    accessToken: string;
}

export interface CustomerResponse extends UserDetails {
    id?: number;
    stripeId?: string;
    shippingAddress?: string;
    billingAddress?: string;
}

export interface SupportAgentResponse extends UserDetails {
    id: number;
    status: 'available' | 'busy';
    phoneNumber: string;
    averageResponseTime?: number;
    averageCustomerRating?: number;
    handledTickets?: number;
    resolvedTickets?: number;
    failedTickets?: number;
    pendingTickets?: number;
}

export interface CourierResponse extends UserDetails {
    id: number;
    status: 'packaging' | 'delivering' | 'returning' | 'ready';
    phoneNumber: string;
    averageCustomerRating?: number;
}

export type UserType =
    | 'admin'
    | 'manager'
    | 'customer'
    | 'supportAgent'
    | 'courier';
