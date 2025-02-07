import { Router } from 'express';
import { RatingController } from '../../../controllers/Rating.controller';
import { RatingService, AdminLogsService } from '../../../services';
import {
    validateId,
    validateObjectId,
    validationErrors,
} from '../../../middlewares/validation';
import { ratingDeletionRateLimiter } from '../../../middlewares/rateLimiting';
import authorize from '../../../middlewares/authorization/authorize';

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
    authorize(['admin']),
    ratingDeletionRateLimiter,
    validateObjectId(),
    validationErrors,
    ratingController.deletePlatformRatingById.bind(ratingController)
);
router.delete(
    '/products/:id',
    authorize(['admin']),
    ratingDeletionRateLimiter,
    validateObjectId(),
    validationErrors,
    ratingController.deleteProductRatingById.bind(ratingController)
);

export default router;
