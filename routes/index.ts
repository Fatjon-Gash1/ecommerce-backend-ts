/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User-related operations
 *   - name: Products
 *     description: Operations related to products
 *   - name: Ratings
 *     description: Operations related to product ratings
 */

import { Router, Request, Response } from 'express';
import userRoutes from './protected/users.route';
import productRoutes from './public/products.route';
import ratingRoutes from './public/ratings.route';

const router: Router = Router();

router.use('/users', userRoutes);

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     description: Retrieve a list of products.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of products.
 */
router.use('/products', productRoutes);

router.use('/ratings', ratingRoutes);

router.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

export default router;
