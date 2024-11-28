import { Router } from 'express';
import { AdminController } from '../../../controllers/Admin.controller';
import {
    AdminService,
    NotificationService,
    AdminLogsService,
} from '../../../services';
import authorize from '../../../middlewares/authorization/authorize';
import {
    registerRateLimiter,
    userDeletionRateLimiter,
} from '../../../middlewares/rateLimiting';
import {
    validateRegistration,
    validateId,
    validateAttribute,
    validateAdminRole,
    validateAdminRoleSet,
    validationErrors,
} from '../../../middlewares/validation';
import adminProducts from './products.route';
import adminOrders from './orders.route';
import adminShippings from './shippings.route';
import adminRatings from './ratings.route';

const router: Router = Router();
const adminController = new AdminController(
    new AdminService(),
    new NotificationService(),
    new AdminLogsService()
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

router.patch(
    '/admins/:adminId/role',
    authorize(['admin']),
    validateId('adminId'),
    validateAdminRoleSet(),
    validationErrors,
    adminController.setAdminRole.bind(adminController)
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
router.use('/orders', adminOrders);
router.use('/shippings', adminShippings);
router.use('/ratings', adminRatings);
// I think i forgot the analytics route
// After: ElasticSearch query methods, Payment route, redis caching, serialization, refactoring...

export default router;
