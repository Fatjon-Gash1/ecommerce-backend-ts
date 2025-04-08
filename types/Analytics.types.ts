export interface PurchasedProductResponse {
    id?: number;
    name: string;
    price: number;
    quantity: number;
    totalRevenue: number;
}

export interface TopCategory {
    categoryId?: number;
    categoryName: string;
    purchaseCount: number;
    totalRevenue?: number;
}
