import { Model } from 'mongoose';
import { PlatformRating, ProductRating, IRating } from '@/models/document';
import { User, Product, Customer } from '@/models/relational';
import {
    UserNotFoundError,
    ProductNotFoundError,
    RatingNotFoundError,
} from '@/errors';

interface RatingDetails {
    firstName: string;
    lastName: string;
    userProfession: string;
    rating: number;
    review: string;
    anonymous: boolean;
}

interface PlatformRatingDetails extends RatingDetails {
    featureHighlights: string;
}

interface ProductRatingDetails extends RatingDetails {
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

interface PlatformRatingResponse extends RatingResponse {
    featureHighlights: string;
    numberOfPurchases?: number;
    mostPurchasesCategory?: string;
}

interface ProductRatingResponse extends RatingResponse {
    productId: number;
    productHighlights?: string;
    alternatives?: number[];
}

/**
 * Service related to platform and product ratings
 */
export class RatingService {
    /**
     * Adds a rating to the platform.
     *
     * @param userId - The id of the user
     * @param details - Rating details
     * @returns A promise that resolves to the created platform rating
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found.
     */
    public async addPlatformRating(
        userId: number,
        details: PlatformRatingDetails
    ): Promise<PlatformRatingResponse> {
        const customer = await User.findByPk(userId);

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const result = await PlatformRating.create({
            userId,
            username: customer.username,
            ...details,
        });

        return {
            userId,
            username: customer.username,
            ...details,
            numberOfPurchases: result.numberOfPurchases,
            mostPurchasesCategory: result.mostPurchasesCategory,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            _id: result._id,
        };
    }

    /**
     * Adds a rating & review to a product.
     *
     * @param userId - The id of the user
     * @param productId - The id of the product
     * @param details - Rating details
     * @returns A promise that resolves to a Product Rating object
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found.
     *
     * @throws {@link ProductNotFoundError}
     * Thrown if the product is not found.
     */
    public async addProductRating(
        userId: number,
        productId: number,
        details: ProductRatingDetails
    ): Promise<ProductRatingResponse> {
        const [product, customer] = await Promise.all([
            Product.findByPk(productId),
            User.findByPk(userId),
        ]);

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        if (!product) {
            throw new ProductNotFoundError();
        }

        const rating = await ProductRating.create({
            userId,
            productId,
            username: customer.username,
            ...details,
        });

        return {
            userId,
            productId,
            username: customer.username,
            ...details,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
            _id: rating._id,
        };
    }

    /**
     * Retrieves all platform ratings.
     *
     * @returns A promise that resolves to all platform ratings
     */
    public async getPlatformRatings(): Promise<PlatformRatingResponse[]> {
        const ratings = await PlatformRating.find({}).select('-__t -__v');

        return ratings.map((rating) => rating.toObject());
    }

    /**
     * Retrieves a platform rating by object id.
     *
     * @param ratingId - The object id of the platform rating
     * @returns A promise that resolves to the platform rating
     *
     * @throws {@link RatingNotFoundError}
     * Thrown if the rating is not found
     */
    public async getPlatformRatingById(
        ratingId: string
    ): Promise<PlatformRatingResponse> {
        const rating =
            await PlatformRating.findById(ratingId).select('-__t -__v');

        if (!rating) {
            throw new RatingNotFoundError();
        }

        return rating.toObject();
    }

    /**
     * Retrieves all platform ratings by customer's id.
     *
     * @param customerId - The id of the customer
     * @returns A promise that resolves to the customer's platform ratings
     * and their total count
     */
    public async getPlatformRatingsByCustomer(
        customerId: number
    ): Promise<{ count: number; ratings: PlatformRatingResponse[] }> {
        const customer = await Customer.findByPk(customerId, {
            include: { model: User, as: 'user', attributes: ['id'] },
        });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const ratings = await PlatformRating.find({
            userId: customer.user!.id,
        }).select('-__t -__v');
        const count = ratings.length;

        return { count, ratings: ratings.map((rating) => rating.toObject()) };
    }

    /**
     * Retrieves all ratings & reviews of a product.
     *
     * @param productId - The id of the product
     * @returns A promise that resolves to all product ratings
     *
     * @throws {@link ProductNotFoundError}
     * Thrown if the product is not found.
     */
    public async getProductRatingsByProductId(
        productId: number
    ): Promise<ProductRatingResponse[]> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        const ratings = await ProductRating.find({ productId })
            .select('-__t -__v')
            .sort({
                rating: -1,
            });

        return ratings.map((rating) => rating.toObject());
    }

    /**
     * Retrieves a product rating & review by id.
     *
     * @param ratingId - The id of the product rating
     * @returns A promise that resolves to the product rating
     *
     * @throws {@link RatingNotFoundError}
     * Thrown if the rating is not found.
     */
    public async getProductRatingById(
        ratingId: string
    ): Promise<ProductRatingResponse> {
        const rating =
            await ProductRating.findById(ratingId).select('-__t -__v');

        if (!rating) {
            throw new RatingNotFoundError();
        }

        return rating.toObject();
    }

    /**
     * Retrieves all product ratings & reviews by customer's user id.
     *
     * @param userId - The id of the user
     * @returns A promise that resolves to the user's product ratings
     */
    public async getProductRatingsByCustomer(
        customerId: number
    ): Promise<{ count: number; ratings: ProductRatingResponse[] }> {
        const customer = await Customer.findByPk(customerId, {
            include: { model: User, as: 'user', attributes: ['id'] },
        });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const ratings = await ProductRating.find({
            userId: customer.user!.id,
        }).select('-__t -__v');
        const count = ratings.length;

        return { count, ratings: ratings.map((rating) => rating.toObject()) };
    }

    /**
     * Generic method that updates an existing rating type
     *
     * @param ratingType - The model to update
     * @param ratingId - The id of the platform rating
     * @param details - Rating details
     * @returns A promise that resolves to the updated platform rating
     *
     * @throws {@link RatingNotFoundError}
     * Thrown if the rating is not found.
     */
    public async updateRating<T extends IRating>(
        ratingType: Model<T>,
        userId: number,
        ratingId: string,
        details: PlatformRatingDetails | ProductRatingDetails
    ): Promise<PlatformRatingResponse | ProductRatingResponse> {
        const updatedRating = await ratingType
            .findOneAndUpdate(
                { _id: ratingId, userId },
                {
                    ...details,
                },
                { new: true }
            )
            .select('-__t -__v')
            .lean<PlatformRatingResponse | ProductRatingResponse>();

        if (!updatedRating) {
            throw new RatingNotFoundError();
        }

        return updatedRating;
    }

    /**
     * Updates a platform rating
     *
     * @param userId - The id of the user
     * @param ratingId - The id of the platform rating
     * @param details - Rating details
     * @returns A promise that resolves to the updated platform rating
     *
     * @throws {@link RatingNotFoundError}
     * Thrown if the rating is not found.
     */
    public async updatePlatformRating(
        userId: number,
        ratingId: string,
        details: PlatformRatingDetails
    ): Promise<PlatformRatingResponse> {
        return (await this.updateRating(
            PlatformRating,
            userId,
            ratingId,
            details
        )) as PlatformRatingResponse;
    }

    /**
     * Updates a product rating
     *
     * @param userId - The id of the user
     * @param ratingId - The id of the product rating
     * @param details - Rating details
     * @returns A promise that resolves to the updated product rating
     *
     * @throws {@link RatingNotFoundError}
     * Thrown if the rating is not found.
     */
    public async updateProductRating(
        userId: number,
        ratingId: string,
        details: ProductRatingDetails
    ): Promise<ProductRatingResponse> {
        return (await this.updateRating(
            ProductRating,
            userId,
            ratingId,
            details
        )) as ProductRatingResponse;
    }

    /**
     * Removes a platform rating by id.
     *
     * @param ratingId - The id of the platform rating
     * @param userId - The user id (optional)
     *
     * @throws {@link RatingNotFoundError}
     * Thrown if the rating is not found.
     */
    public async deletePlatformRatingById(
        ratingId: string,
        userId?: number
    ): Promise<void> {
        if (userId) {
            const deleted = await PlatformRating.findOneAndDelete({
                userId,
                _id: ratingId,
            });

            if (!deleted) {
                throw new RatingNotFoundError('Platform rating not found');
            }
        } else {
            const deleted = await PlatformRating.findByIdAndDelete(ratingId);

            if (!deleted) {
                throw new RatingNotFoundError('Platform rating not found');
            }
        }
    }

    /**
     * Removes a product rating by id.
     *
     * @param ratingId - The id of the product rating
     * @param userId - The user id (optional)
     *
     * @throws {@link RatingNotFoundError}
     * Thrown if the rating is not found.
     */
    public async deleteProductRatingById(
        ratingId: string,
        userId?: number
    ): Promise<void> {
        if (userId) {
            const deleted = await ProductRating.findOneAndDelete({
                userId,
                _id: ratingId,
            });

            if (!deleted) {
                throw new RatingNotFoundError('Product rating not found');
            }
        } else {
            const deleted = await ProductRating.findByIdAndDelete(ratingId);

            if (!deleted) {
                throw new RatingNotFoundError('Product rating not found');
            }
        }
    }
}
