import { Router } from 'express';
import { RatingController } from '../../controllers/Rating.controller';
import { RatingService } from '../../services';
const router: Router = Router();
const ratingController = new RatingController(new RatingService());

router.get(
    '/rating/:id',
    ratingController.getRatingById.bind(ratingController)
);
