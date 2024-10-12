import { Router } from 'express';
import { RatingController } from '../../controllers/Rating.controller';
import { RatingService } from '../../services';
import { ratingUpdateRateLimiter } from '../../middlewares/rateLimiting';
import {
    validatePlatformRating,
    validateProductRating,
    validatePlatformRatingUpdate,
    validateProductRatingUpdate,
    validationErrors,
} from '../../middlewares/validation';

const router: Router = Router();
const ratingController = new RatingController(new RatingService());

router.post(
    '/platform',
    validatePlatformRating(),
    validationErrors,
    ratingController.addPlatformRating.bind(ratingController)
);
router.post(
    '/products',
    validateProductRating(),
    validationErrors,
    ratingController.addProductRating.bind(ratingController)
);

router.patch(
    '/platform',
    ratingUpdateRateLimiter,
    validatePlatformRatingUpdate(),
    validationErrors,
    ratingController.updateOwnPlatformRating.bind(ratingController)
);
router.patch(
    '/products',
    ratingUpdateRateLimiter,
    validateProductRatingUpdate(),
    validationErrors,
    ratingController.updateOwnProductRating.bind(ratingController)
);

router.delete(
    '/platform',
    ratingController.deleteOwnPlatformRating.bind(ratingController)
);
router.delete(
    '/products',
    ratingController.deleteOwnProductRating.bind(ratingController)
);

export default router;
