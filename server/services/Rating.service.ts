import {
    PlatformRating,
    IPlatformRating,
    ProductRating,
    IProductRating,
} from '../models/document';
import { User, Product } from '../models/relational';
import {
    UserNotFoundError,
    ProductNotFoundError,
    RatingNotFoundError,
} from '../errors';

/**
 * Service related to platform and product ratings
 */
export class RatingService {
    /**
     * Adds a rating to the platform.
     *
     * @param details - Rating details
     * @returns A promise that resolves to the created platform rating
     */
    public async addPlatformRating(
        details: IPlatformRating
    ): Promise<IPlatformRating> {
        const {
            userId,
            firstName,
            lastName,
            userProfession,
            rating,
            review,
            anonymous,
            featureHighlights,
        } = details;
        const customer = await User.findByPk(userId);

        if (!customer) {
            throw new UserNotFoundError('Could not find customer');
        }

        const result = await PlatformRating.create({
            userId,
            username: customer.username,
            firstName,
            lastName,
            userProfession,
            rating,
            review,
            anonymous,
            featureHighlights,
        });

        return result;
    }

    /**
     * Retrieves all platform ratings.
     *
     * @returns A promise that resolves to all platform ratings
     */
    public async getPlatformRatings(): Promise<IPlatformRating[]> {
        return await PlatformRating.find({});
    }

    /**
     * Retrieves a platform rating by id.
     *
     * @param ratingId - The id of the platform rating
     * @returns A promise that resolves to the platform rating
     */
    public async getPlatformRatingById(
        ratingId: number
    ): Promise<IPlatformRating> {
        const rating = await PlatformRating.findById(ratingId);

        if (!rating) {
            throw new RatingNotFoundError();
        }

        return rating;
    }

    /**
     * Retrieves all platform ratings by customer's user id.
     *
     * @param userId - The id of the customer
     * @returns A promise that resolves to the customer's platform ratings
     */
    public async getPlatformRatingsByCustomer(
        userId: number
    ): Promise<IPlatformRating[]> {
        const customer = await User.findByPk(userId);

        if (!customer) {
            throw new UserNotFoundError('Could not find customer');
        }

        return await PlatformRating.find({ userId });
    }

    /**
     * Updates an existing platform rating.
     *
     * @param ratingId - The id of the platform rating
     * @param details - Rating details
     * @returns A promise that resolves to the updated platform rating
     */
    public async updatePlatformRating(
        ratingId: number,
        details: IPlatformRating
    ): Promise<IPlatformRating> {
        const updatedRating = await PlatformRating.findByIdAndUpdate(ratingId, {
            details,
        });

        if (!updatedRating) {
            throw new RatingNotFoundError();
        }

        return updatedRating;
    }

    /**
     * Removes a platform rating by id.
     *
     * @param ratingId - The id of the platform rating
     * @returns A promise that resolves to a boolean indicating
     * if the rating was removed
     */
    public async deletePlatformRatingById(ratingId: number): Promise<void> {
        const deleted = await PlatformRating.findByIdAndDelete(ratingId);

        if (!deleted) {
            throw new RatingNotFoundError();
        }
    }

    /**
     * Adds a rating & review to a product.
     *
     * @param details - Rating details
     */
    public async addProductRating(
        details: IProductRating
    ): Promise<IProductRating> {
        const {
            userId,
            productId,
            firstName,
            lastName,
            userProfession,
            rating,
            review,
            anonymous,
            productHighlights,
            alternatives,
        } = details;

        const [product, customer] = await Promise.all([
            Product.findByPk(productId),
            User.findByPk(userId),
        ]);

        if (!customer) {
            throw new UserNotFoundError('Could not find customer');
        }

        if (!product) {
            throw new ProductNotFoundError();
        }

        return await ProductRating.create({
            userId,
            productId,
            username: customer.username,
            firstName,
            lastName,
            userProfession,
            rating,
            review,
            anonymous,
            productHighlights,
            alternatives,
        });
    }

    /**
     * Retrieves all product ratings & reviews.
     *
     * @param productId - The ID of the product
     * @returns A promise that resolves to all product ratings
     */
    public async getProductRatings(
        productId: number
    ): Promise<IProductRating[]> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        return await ProductRating.find({ productId });
    }

    /**
     * Retrieves a product rating & review by id.
     *
     * @param reviewId - The id of the product rating
     * @returns A promise that resolves to the product rating
     */
    public async getProductRatingById(
        ratingId: number
    ): Promise<IProductRating> {
        const rating = await ProductRating.findById(ratingId);

        if (!rating) {
            throw new RatingNotFoundError(
                `Product rating with id: ${ratingId} not found`
            );
        }

        return rating;
    }

    /**
     * Retrieves all product ratings & reviews by customer's user id.
     *
     * @param userId - The id of the user
     * @returns A promise that resolves to the user's product ratings
     */
    public async getProductRatingsByCustomer(
        userId: number
    ): Promise<IProductRating[]> {
        const customer = await User.findByPk(userId);

        if (!customer) {
            throw new UserNotFoundError('Could not find customer');
        }

        return await ProductRating.find({ userId });
    }

    /**
     * Updates an existing product rating & review.
     *
     * @param ratingId - The id of the product rating
     * @param details - Rating details
     * @returns A promise that resolves to the updated product rating
     */
    public async updateProductRating(
        ratingId: number,
        details: IProductRating
    ): Promise<IProductRating> {
        const updatedRating = await ProductRating.findByIdAndUpdate(ratingId, {
            details,
        });

        if (!updatedRating) {
            throw new RatingNotFoundError();
        }

        return updatedRating;
    }

    /**
     * Removes a product rating & review by id.
     *
     * @param ratingId - The id of the product rating
     * @returns A promise that resolves to a boolean indicating
     * if the rating was removed
     */
    public async deleteProductRatingById(ratingId: number): Promise<boolean> {
        const deleted = await ProductRating.findByIdAndDelete(ratingId);

        if (!deleted) {
            throw new RatingNotFoundError('Product rating not found');
        }

        return true;
    }
}
