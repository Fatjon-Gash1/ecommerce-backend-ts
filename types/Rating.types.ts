interface RatingDetails {
    firstName: string;
    lastName: string;
    userProfession: string;
    rating: number;
    review: string;
    anonymous: boolean;
}

export interface PlatformRatingDetails extends RatingDetails {
    featureHighlights: string;
}

export interface ProductRatingDetails extends RatingDetails {
    productHighlights: string;
    alternatives: number[];
}

interface RatingResponse {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    userProfession?: string;
    rating: number;
    review: string;
    anonymous?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    _id: unknown;
}

export interface PlatformRatingResponse extends RatingResponse {
    featureHighlights: string;
    numberOfPurchases?: number;
    mostPurchasesCategory?: string;
}

export interface ProductRatingResponse extends RatingResponse {
    productId: number;
    productHighlights?: string;
    alternatives?: number[];
}
