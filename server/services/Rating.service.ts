import {
    PlatformRating,
    IPlatformRating,
    ProductReview,
    IProductReview,
} from '../models/document';
import { User, Product } from '../models/relational';
import {
    UserNotFoundError,
    ProductNotFoundError,
    RatingNotFoundError,
    RatingUpdateError,
    RatingCreationError,
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
    public async getPlatformRating(ratingId: number): Promise<IPlatformRating> {
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
    public async deletePlatformRating(ratingId: number): Promise<void> {
        const deleted = await PlatformRating.findByIdAndDelete(ratingId);

        if (!deleted) {
            throw new RatingNotFoundError();
        }
    }

    /**
     * Adds a review to a product.
     *
     * @param details - Review details
     */
    public async addProductReview(
        details: IProductReview
    ): Promise<IProductReview> {
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

        return await ProductReview.create({
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
     * Retrieves all product reviews.
     *
     * @param productId - The ID of the product
     * @returns A promise that resolves to all product reviews
     */
    public async getProductReviews(
        productId: number
    ): Promise<IProductReview[]> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        return await ProductReview.find({ productId });
    }

    /**
     * Retrieves a product review by id.
     *
     * @param reviewId - The id of the product review
     * @returns A promise that resolves to the product review
     */
    public async getProductReview(reviewId: number): Promise<IProductReview> {
        const review = await ProductReview.findById(reviewId);

        if (!review) {
            throw new RatingNotFoundError(
                `Product review with id: ${reviewId} not found`
            );
        }

        return review;
    }

    /**
     * Retrieves all product reviews by customer's user id.
     *
     * @param userId - The id of the user
     * @returns A promise that resolves to the user's product reviews
     */
    public async getProductReviewsByCustomer(
        userId: number
    ): Promise<IProductReview[]> {
        const customer = await User.findByPk(userId);

        if (!customer) {
            throw new UserNotFoundError('Could not find customer');
        }

        return await ProductReview.find({ userId });
    }

    /**
     * Updates an existing product review.
     *
     * @param reviewId - The id of the product review
     * @param details - Review details
     * @returns A promise that resolves to the updated product review
     */
    public async updateProductReview(
        reviewId: number,
        details: IProductReview
    ): Promise<IProductReview> {
        const updatedReview = await ProductReview.findByIdAndUpdate(reviewId, {
            details,
        });

        if (!updatedReview) {
            throw new RatingNotFoundError();
        }

        return updatedReview;
    }

    /**
     * Removes a product review by id.
     *
     * @param reviewId - The id of the product review
     * @returns A promise that resolves to a boolean indicating
     * if the review was removed
     */
    public async deleteProductReview(reviewId: number): Promise<boolean> {
        const deleted = await ProductReview.findByIdAndDelete(reviewId);

        if (!deleted) {
            throw new RatingNotFoundError('Product review not found');
        }

        return true;
    }
}
