export interface PurchasedProductResponse {
    id: number;
    name: string;
    currentPrice: number;
    purchaseCount: number;
    totalSpent?: number;
    totalRevenue?: number;
}

export interface TopCategory {
    categoryId?: number;
    categoryName: string;
    currentProducts: number;
    purchaseCount: number;
    totalRevenue?: number;
}
