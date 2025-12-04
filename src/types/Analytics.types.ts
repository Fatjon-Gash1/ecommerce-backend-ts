import type { CustomerMembership, CustomerResponse } from './User.types';

export interface PurchasedProductResponse {
    id: number;
    name: string;
    productNumber?: string;
    category?: string;
    currency?: string;
    weight?: number;
    type?: string;
    averagePurchasePrice?: number;
    currentPrice: number;
    purchaseCount: number;
    totalSpent?: number;
    totalRevenue?: number;
}

export interface PurchasedCategoryResponse {
    id: number;
    name: string;
    totalProducts: number;
    purchaseCount: number;
    totalRevenue: number;
}

export type TopCustomerSortBy =
    | 'totalRevenue'
    | 'purchaseCount'
    | 'orderCount'
    | 'totalSpent';

interface OrderDataForTopCustomers {
    orderCount: number;
    totalSpentOnOrders: number;
}

interface PurchaseDataForTopCustomers {
    totalProductPurchases: number;
    totalSpent: number;
}

export interface TopCustomersResponse extends CustomerResponse {
    data: OrderDataForTopCustomers | PurchaseDataForTopCustomers;
}

export interface PreparedTopCustomerObject {
    customerId: number;
    customerFirstName: string;
    customerLastName: string;
    customerUsername: string;
    customerEmail: string;
    customerMembership: CustomerMembership;
    orderCount?: number;
    totalSpent?: number;
    purchaseCount?: number;
    totalRevenue?: number;
}

export type BaseInterval = 'weekly' | 'monthly' | 'yearly' | 'full';
