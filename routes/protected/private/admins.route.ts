import { Router } from 'express';
import { AdminController } from '@/controllers/Admin.controller';
import {
    AdminService,
    NotificationService,
    AdminLogsService,
    PlatformDataService,
    PaymentService,
} from '@/services';
import authorize from '@/middlewares/authorization/authorize';
import {
    registerRateLimiter,
    userDeletionRateLimiter,
} from '@/middlewares/rateLimiting';
import {
    validateRegistration,
    validateId,
    validateAttribute,
    validateAdminRole,
    validateAdminRoleSet,
    validationErrors,
    validatePlatformData,
    validateObjectId,
} from '@/middlewares/validation';
import adminProducts from './products.route';
import adminSubscriptions from './subscriptions.route';
import adminOrders from './orders.route';
import adminPayments from './payments.route';
import adminShippings from './shippings.route';
import adminRatings from './ratings.route';
import adminAnalytics from './analytics.route';
import { checkExact } from 'express-validator';

const router: Router = Router();
const adminService = new AdminService(
    new PaymentService(process.env.STRIPE_KEY as string),
    new NotificationService()
);
const adminController = new AdminController(
    adminService,
    new AdminLogsService(),
    new PlatformDataService()
);

router.post(
    '/customers',
    authorize(['admin']),
    registerRateLimiter,
    validateRegistration(),
    validationErrors,
    adminController.registerCustomer.bind(adminController)
);
router.post(
    '/admins',
    authorize(['admin']),
    registerRateLimiter,
    validateRegistration(),
    validationErrors,
    adminController.registerAdmin.bind(adminController)
);

/**
 * @swagger
 * /users/admin/customers:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     description: Retrieve all customers
 *     responses:
 *       200:
 *         description: Successfully retrieved customers
 */
router.get('/customers', adminController.getAllCustomers.bind(adminController));
router.get(
    '/customers/active',
    adminController.findActiveCustomers.bind(adminController)
);
router.get(
    '/customers/search',
    validateAttribute(),
    validationErrors,
    adminController.findCustomerByAttribute.bind(adminController)
);
router.get(
    '/customers/:id',
    validateId(),
    validationErrors,
    adminController.getCustomerById.bind(adminController)
);
router.get(
    '/admins',
    authorize(['admin']),
    adminController.getAllAdmins.bind(adminController)
);
router.get(
    '/admins/search',
    authorize(['admin']),
    validateAdminRole(),
    validationErrors,
    adminController.getAdminsByRole.bind(adminController)
);
router.get(
    '/admins/:id',
    authorize(['admin']),
    validateId(),
    validationErrors,
    adminController.getAdminById.bind(adminController)
);
router.get(
    '/platform-data',
    authorize(['admin']),
    adminController.getPlatformData.bind(adminController)
);

router.patch(
    '/admins/:adminId/role',
    authorize(['admin']),
    validateId('adminId'),
    validateAdminRoleSet(),
    validationErrors,
    adminController.setAdminRole.bind(adminController)
);
router.patch(
    '/platform-data/:id',
    authorize(['admin']),
    validateObjectId(),
    validatePlatformData(),
    checkExact([]),
    validationErrors,
    adminController.updatePlatformData.bind(adminController)
);

router.delete(
    '/users/:id',
    authorize(['admin']),
    userDeletionRateLimiter,
    validateId(),
    validationErrors,
    adminController.deleteUserById.bind(adminController)
);

router.use('/products', adminProducts);
router.use('/subscriptions', adminSubscriptions);
router.use('/orders', adminOrders);
router.use('/payments', adminPayments);
router.use('/shippings', adminShippings);
router.use('/ratings', adminRatings);
router.use('/analytics', adminAnalytics);

export default router;
