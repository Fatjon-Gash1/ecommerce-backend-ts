import { Router } from 'express';
import { RatingController } from '@/controllers/Rating.controller';
import { RatingService } from '@/services';
import { ratingUpdateRateLimiter } from '@/middlewares/rateLimiting';
import {
    validatePlatformRating,
    validateProductRating,
    validatePlatformRatingUpdate,
    validateProductRatingUpdate,
    validateId,
    validationErrors,
    validateObjectId,
} from '@/middlewares/validation';

const router: Router = Router();
const ratingController = new RatingController(new RatingService());

router.post(
    '/platform',
    validatePlatformRating(),
    validationErrors,
    ratingController.addPlatformRating.bind(ratingController)
);
router.post(
    '/products/:productId',
    validateId('productId'),
    validateProductRating(),
    validationErrors,
    ratingController.addProductRating.bind(ratingController)
);

router.patch(
    '/platform/:ratingId',
    ratingUpdateRateLimiter,
    validateObjectId('ratingId'),
    validatePlatformRatingUpdate(),
    validationErrors,
    ratingController.updateOwnPlatformRating.bind(ratingController)
);
router.patch(
    '/products/:ratingId',
    ratingUpdateRateLimiter,
    validateObjectId('ratingId'),
    validateProductRatingUpdate(),
    validationErrors,
    ratingController.updateOwnProductRating.bind(ratingController)
);

router.delete(
    '/platform/:ratingId',
    ratingController.deleteOwnPlatformRating.bind(ratingController)
);
router.delete(
    '/products/:ratingId',
    ratingController.deleteOwnProductRating.bind(ratingController)
);

export default router;
