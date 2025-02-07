import { Router, Request, Response } from 'express';
import userRoutes from './protected/users.route';
import productRoutes from './public/products.route';
import ratingRoutes from './public/ratings.route';
// Testing..
import scheduleRoutes from './protected/schedules.route';

const router: Router = Router();

router.use('/users', userRoutes);

router.use('/products', productRoutes);

router.use('/ratings', ratingRoutes);

// Testing..
router.use('/tests', scheduleRoutes);

router.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

export default router;
