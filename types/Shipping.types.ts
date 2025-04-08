export interface ShippingCountryResponse {
    id?: number;
    name: string;
    rate: number;
}

export interface ShippingCityResponse {
    id?: number;
    name: string;
    postalCode: number;
}

export interface ShippingMethodResponse {
    id?: number;
    method: string;
    rate: number;
}

export interface ShippingWeightResponse {
    id?: number;
    weight: string;
    rate: number;
}

export interface ProductItem {
    productId: number;
    quantity: number;
}

export interface ShippingCostResponse {
    cost: number;
    weightCategory: WeightCategory;
    orderWeight: number;
}

export type WeightCategory =
    | 'light'
    | 'standard'
    | 'heavy'
    | 'very-heavy'
    | 'extra-heavy';
