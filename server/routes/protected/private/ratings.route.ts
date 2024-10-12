import { Router } from 'express';
import { RatingController } from '../../../controllers/Rating.controller';
import { RatingService, AdminLogsService } from '../../../services';
import { validateId, validationErrors } from '../../../middlewares/validation';
import { ratingDeletionRateLimiter } from '../../../middlewares/rateLimiting';

const router: Router = Router();
const ratingController = new RatingController(
    new RatingService(),
    new AdminLogsService()
);

router.get(
    '/platform/customers/:id',
    validateId(),
    validationErrors,
    ratingController.getPlatformRatingsByCustomer.bind(ratingController)
);
router.get(
    '/products/customers/:id',
    validateId(),
    validationErrors,
    ratingController.getProductRatingsByCustomer.bind(ratingController)
);

router.delete(
    '/platform/:id',
    ratingDeletionRateLimiter,
    validateId(),
    validationErrors,
    ratingController.deletePlatformRatingById.bind(ratingController)
);
router.delete(
    '/products/:id',
    ratingDeletionRateLimiter,
    validateId(),
    validationErrors,
    ratingController.deleteProductRatingById.bind(ratingController)
);

export default router;
