import { Router, Request, Response } from 'express';
import customerRoutes from './customers.route';
//import adminRoutes from './admins.route';
//import platformRoutes from './platform.route';
//import paymentsRoutes from './payments.route';

const router: Router = Router();

// Main route
router.get('/', (_req: Request, res: Response) => {
    res.send('Main route!');
});

router.use('/customers', customerRoutes);

//router.use('/admins', adminRoutes);

//router.use('/platform', platformRoutes);

//router.use('/payments', paymentsRoutes);

export default router;
