import { Request, Response } from 'express';
import { RatingService, LoggingService } from '@/services';
import { Logger } from '@/logger';
import {
    UserNotFoundError,
    ProductNotFoundError,
    RatingNotFoundError,
} from '@/errors';
import { JwtPayload } from 'jsonwebtoken';

export class RatingController {
    private ratingService: RatingService;
    private loggingService?: LoggingService;
    private logger: Logger;

    constructor(ratingService: RatingService, loggingService?: LoggingService) {
        this.ratingService = ratingService;
        this.loggingService = loggingService;
        this.logger = new Logger();
    }

    public async addPlatformRating(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const { details } = req.body;

        try {
            const rating = await this.ratingService.addPlatformRating(
                userId,
                details
            );
            return res.status(201).json({
                message: 'Rating added successfully',
                rating,
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error adding rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error adding rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async addProductRating(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const productId: number = Number(req.params.productId);
        const { details } = req.body;

        try {
            const rating = await this.ratingService.addProductRating(
                userId,
                productId,
                details
            );
            return res
                .status(201)
                .json({ message: 'Rating added successfully', rating });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error adding rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            if (error instanceof ProductNotFoundError) {
                this.logger.error('Error adding rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error adding rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPlatformRatings(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const ratings = await this.ratingService.getPlatformRatings();
            return res.status(200).json({ ratings });
        } catch (error) {
            this.logger.error('Error getting platform ratings: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPlatformRatingById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { ratingId } = req.params;

        try {
            const rating =
                await this.ratingService.getPlatformRatingById(ratingId);
            return res.status(200).json({ rating });
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                this.logger.error('Error getting rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPlatformRatingsByCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId: number = Number(req.params.id);

        try {
            const { count, ratings } =
                await this.ratingService.getPlatformRatingsByCustomer(
                    customerId
                );
            return res.status(200).json({ total: count, ratings });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error getting customer ratings: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting customer ratings: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductRatingsByProductId(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId: number = Number(req.params.productId);

        try {
            const productRatings =
                await this.ratingService.getProductRatingsByProductId(
                    productId
                );
            return res.status(200).json({ productRatings });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                this.logger.error('Error getting rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductRatingById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { ratingId } = req.params;

        try {
            const productRating =
                await this.ratingService.getProductRatingById(ratingId);
            return res.status(200).json({ productRating });
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                this.logger.error('Error getting rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductRatingsByCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId: number = Number(req.params.id);

        try {
            const { count, ratings } =
                await this.ratingService.getProductRatingsByCustomer(
                    customerId
                );
            return res.status(200).json({ total: count, ratings });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error getting rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateOwnPlatformRating(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const { ratingId } = req.params;
        const { details } = req.body;

        try {
            const updatedRating = await this.ratingService.updatePlatformRating(
                userId,
                ratingId,
                details
            );
            return res.status(200).json({ updatedRating });
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                this.logger.error('Error updating rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error updating rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateOwnProductRating(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const { ratingId } = req.params;
        const { details } = req.body;

        try {
            const updatedRating = await this.ratingService.updateProductRating(
                userId,
                ratingId,
                details
            );
            return res.status(200).json({ updatedRating });
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                this.logger.error('Error updating rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error updating rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteOwnPlatformRating(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const ratingId: string = req.params.ratingId;

        try {
            await this.ratingService.deletePlatformRatingById(ratingId, userId);
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                this.logger.error('Error deleting rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error deleting rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deletePlatformRatingById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const ratingId: string = req.params.id;
        const { username } = req.user as JwtPayload;

        try {
            await this.ratingService.deletePlatformRatingById(ratingId);
            res.sendStatus(204);

            await this.loggingService!.logOperation(
                username,
                'rating',
                'delete'
            );
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                this.logger.error('Error deleting rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error deleting rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteOwnProductRating(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const ratingId: string = req.params.ratingId;

        try {
            await this.ratingService.deleteProductRatingById(ratingId, userId);
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                this.logger.error('Error deleting rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error deleting rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteProductRatingById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const ratingId: string = req.params.id;
        const { username } = req.user as JwtPayload;

        try {
            await this.ratingService.deleteProductRatingById(ratingId);
            res.sendStatus(204);

            await this.loggingService!.logOperation(
                username,
                'rating',
                'delete'
            );
        } catch (error) {
            if (error instanceof RatingNotFoundError) {
                this.logger.error('Error deleting rating: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error deleting rating: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
