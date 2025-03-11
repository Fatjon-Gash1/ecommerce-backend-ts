import { Router } from 'express';
import { RatingController } from '@/controllers/Rating.controller';
import { RatingService } from '@/services';
import {
    validateId,
    validateObjectId,
    validationErrors,
} from '@/middlewares/validation';

const router: Router = Router();
const ratingController = new RatingController(new RatingService());

router.get(
    '/platform/:ratingId',
    validateObjectId('ratingId'),
    validationErrors,
    ratingController.getPlatformRatingById.bind(ratingController)
);
router.get(
    '/products/:productId',
    validateId('productId'),
    validationErrors,
    ratingController.getProductRatingsByProductId.bind(ratingController)
);
router.get(
    '/platform',
    ratingController.getPlatformRatings.bind(ratingController)
);
router.get(
    '/products/rating/:ratingId',
    validateObjectId('ratingId'),
    validationErrors,
    ratingController.getProductRatingById.bind(ratingController)
);

export default router;
