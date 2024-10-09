import { Router } from 'express';
import { AdminController } from '../controllers/Admin.controller';
import {
    AdminService,
    NotificationService,
    AdminLogsService,
} from '../services';
import authorize from '../middlewares/authorization/authorize';
import {
    validateRegistration,
    validateId,
    validateAttribute,
    validateAdminRole,
    validateAdminUsername,
    validateAdminRoleSet,
    validationErrors,
} from '../middlewares/validation';

const router: Router = Router();
const adminService = new AdminService();
const notificationService = new NotificationService();
const adminLogsService = new AdminLogsService();
const adminController = new AdminController(
    adminService,
    notificationService,
    adminLogsService
);

router.post(
    '/customers',
    authorize(['admin']),
    validateAdminUsername(),
    validateRegistration(),
    validationErrors,
    adminController.registerCustomer.bind(adminController)
);
router.post(
    '/admins',
    authorize(['admin']),
    validateAdminUsername(),
    validateRegistration(),
    validationErrors,
    adminController.registerAdmin.bind(adminController)
);

router.get(
    '/customers/:id',
    validateId(),
    validationErrors,
    adminController.getCustomerById.bind(adminController)
);
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
router.get('/customers', adminController.getAllCustomers.bind(adminController));

router.get(
    '/admins/:id',
    authorize(['admin']),
    validateId(),
    validationErrors,
    adminController.getAdminById.bind(adminController)
);
router.get(
    '/admins/search',
    authorize(['admin']),
    validateAdminRole(),
    validationErrors,
    adminController.getAdminsByRole.bind(adminController)
);
router.get(
    '/admins',
    authorize(['admin']),
    adminController.getAllAdmins.bind(adminController)
);

router.patch(
    '/admins/:id/role',
    authorize(['admin']),
    validateAdminUsername(),
    validateAdminRoleSet(),
    validationErrors,
    adminController.setAdminRole.bind(adminController)
);

router.delete(
    '/admins/:id',
    authorize(['admin']),
    validateAdminUsername(),
    validateId(),
    validationErrors,
    adminController.deleteUserById.bind(adminController)
);

export default router;
