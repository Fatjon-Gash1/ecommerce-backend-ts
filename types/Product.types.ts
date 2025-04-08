export interface ProductDetails {
    name: string;
    description: string;
    currency: string;
    price: number;
    discount?: number;
    availableDue?: Date | null;
    imageUrl: string;
    stockQuantity?: number;
    weight: number;
    views?: number;
}

export interface ProductObject {
    name: string;
    description: string;
    price: number;
}

export interface CategoryResponse {
    id?: number;
    name: string;
    description: string;
    hasProducts?: boolean;
    parentId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductResponse {
    id?: number;
    categoryId?: number;
    name: string;
    description: string;
    currency: string;
    price: number;
    discount?: number;
    imageUrl: string;
    stockQuantity?: number;
    weight: number;
    views?: number;
    updatedAt?: Date;
    createdAt?: Date;
}

export type Promotion = 'newArrival' | 'discount';
