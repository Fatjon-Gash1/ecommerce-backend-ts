import { Router, Request, Response } from 'express';
import {
    getRatings,
    getRatingById,
    createRating,
    updateRating,
    deleteRating,
} from '../controllers/Platform.controller';

const router: Router = Router();

// Ratings routes
router.get('/ratings', (req: Request, res: Response) => getRatings(req, res));

router.get('/ratings/:id', (req: Request, res: Response) =>
    getRatingById(req, res)
);

router.post('/ratings', (req: Request, res: Response) =>
    createRating(req, res)
);

router.put('/ratings/:id', (req: Request, res: Response) =>
    updateRating(req, res)
);

router.delete('/ratings/:id', (req: Request, res: Response) =>
    deleteRating(req, res)
);

export default router;
