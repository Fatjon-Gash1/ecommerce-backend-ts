import { Request, Response } from 'express';
import { RatingService } from '../services';
import {
    UserNotFoundError,
    ProductNotFoundError,
    RatingNotFoundError,
} from '../errors';

export class RatingController {
    private ratingService: RatingService;

    constructor(ratingService: RatingService) {
        this.ratingService = ratingService;
    }

    public async addPlatformRating(req: Request, res: Response): Promise<void> {
        const { details } = req.body;

        try {
            const rating = await this.ratingService.addPlatformRating(details);
            res.status(201).json({
                message: 'Rating added successfully',
                rating,
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error adding rating: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error adding rating: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPlatformRatings(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const ratings = await this.ratingService.getPlatformRatings();
            res.status(200).json({ ratings });
        } catch (error) {
            console.error('Error getting platform ratings: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPlatformRating(req: Request, res: Response): Promise<void> {
        const ratingId: number = Number(req.params.id);

        try {
            const rating = await this.ratingService.getPlatformRating(ratingId);
            res.status(200).json({ rating });
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                console.error('Error getting rating: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting rating: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPlatformRatingsByCustomer(
        req: Request,
        res: Response
    ): Promise<void> {
        const userId: number = Number(req.params.id);

        try {
            const customerRatings =
                await this.ratingService.getPlatformRatingsByCustomer(userId);
            res.status(200).json({ customerRatings });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error getting customer ratings: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting customer ratings: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async updatePlatformRating(
        req: Request,
        res: Response
    ): Promise<void> {
        const ratingId: number = Number(req.params.id);
        const { details } = req.body;

        try {
            const updatedRating = await this.ratingService.updatePlatformRating(
                ratingId,
                details
            );
            res.status(200).json({ updatedRating });
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                console.error('Error updating rating: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error updating rating: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deletePlatformRating(
        req: Request,
        res: Response
    ): Promise<void> {
        const ratingId: number = Number(req.params.id);

        try {
            await this.ratingService.deletePlatformRating(ratingId);
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                console.error('Error deleting rating: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error deleting rating: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async addProductReview(req: Request, res: Response): Promise<void> {
        const { details } = req.body;

        try {
            const review = await this.ratingService.addProductReview(details);
            res.status(201).json({ review });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error adding review: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            if (error instanceof ProductNotFoundError) {
                console.error('Error adding review: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error adding review: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductReviews(req: Request, res: Response): Promise<void> {
        const productId: number = Number(req.params.id);

        try {
            const productReviews =
                await this.ratingService.getProductReviews(productId);
            res.status(200).json({ productReviews });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error getting review: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting review: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductReview(req: Request, res: Response): Promise<void> {
        const reviewId: number = Number(req.params.id);

        try {
            const productReview =
                await this.ratingService.getProductReview(reviewId);
            res.status(200).json({ productReview });
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                console.error('Error getting review: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting review: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductReviewsByCustomer(
        req: Request,
        res: Response
    ): Promise<void> {
        const userId: number = Number(req.params.id);

        try {
            const productReview =
                await this.ratingService.getProductReviewsByCustomer(userId);
            res.status(200).json({ productReview });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error getting review: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting review: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateProductReview(
        req: Request,
        res: Response
    ): Promise<void> {
        const reviewId: number = Number(req.params.id);
        const { details } = req.body;

        try {
            const updatedReview = await this.ratingService.updateProductReview(
                reviewId,
                details
            );
            res.status(200).json({ updatedReview });
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                console.error('Error updating review: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error updating review: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteProductReview(
        req: Request,
        res: Response
    ): Promise<void> {
        const reviewId: number = Number(req.params.id);

        try {
            await this.ratingService.deleteProductReview(reviewId);
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                console.error('Error deleting review: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error deleting review: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
