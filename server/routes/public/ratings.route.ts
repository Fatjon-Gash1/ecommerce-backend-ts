import { Router } from 'express';
import { RatingController } from '../../controllers/Rating.controller';
import { RatingService } from '../../services';
import { validateId, validationErrors } from '../../middlewares/validation';

const router: Router = Router();
const ratingController = new RatingController(new RatingService());

router.get(
    '/platform/:id',
    validateId(),
    validationErrors,
    ratingController.getPlatformRatingById.bind(ratingController)
);
router.get(
    '/products/:id',
    validateId(),
    validationErrors,
    ratingController.getProductRatings.bind(ratingController)
);
router.get(
    '/platform',
    ratingController.getPlatformRatings.bind(ratingController)
);
router.get(
    '/products/rating/:id',
    validateId(),
    validationErrors,
    ratingController.getProductRatingById.bind(ratingController)
);

export default router;
