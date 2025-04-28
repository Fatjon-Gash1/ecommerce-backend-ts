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

export interface CustomerResponse {
    id?: number;
    stripeId?: string;
    shippingAddress?: string;
    billingAddress?: string;
    isActive?: boolean;
    createdAt?: Date;
    profilePictureUrl?: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
}

export type UserType = 'admin' | 'manager' | 'customer';
