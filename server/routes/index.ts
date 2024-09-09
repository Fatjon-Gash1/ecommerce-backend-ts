import { Router, Request, Response } from 'express';

const router: Router = Router();

// Default route
router.get('/', (_req: Request, res: Response) => {
    res.send('Default route!');
});

// Import and use user routes
import customerRoutes from './customers.route';
router.use('/customers', customerRoutes);

import adminRoutes from './admins.route';
router.use('/admins', adminRoutes);

// Import and use platform routes
import platformRoutes from './platform.route';
router.use('/platform', platformRoutes);

export default router;
