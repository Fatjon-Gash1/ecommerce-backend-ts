import { Router, Request, Response } from 'express';
import userRoutes from './users.route';
import productRoutes from './products.route';
import cartRoutes from './carts.route';
import orderRoutes from './orders.route';
import shippingRoutes from './shipping.route';
import paymentRoutes from './payments.route';
import analyticRoutes from './analytics.route';
import ratingRoutes from './ratings.route';
const router: Router = Router();

router.use('/users', userRoutes);

router.use('/products', productRoutes);

router.use('/carts', cartRoutes);

router.use('/orders', orderRoutes);

router.use('/shipping', shippingRoutes);

router.use('/payments', paymentRoutes);

router.use('/analytics', analyticRoutes);

router.use('/ratings', ratingRoutes);

router.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

export default router;
