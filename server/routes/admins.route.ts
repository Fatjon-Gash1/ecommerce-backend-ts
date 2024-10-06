import { Router } from 'express';
import { AdminController } from '../controllers/Admin.controller';
import {
    AdminService,
    NotificationService,
    AdminLogsService,
} from '../services';

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
    adminController.registerCustomer.bind(adminController)
);
router.post('/admins', adminController.registerAdmin.bind(adminController));

router.get(
    '/customers/:id',
    adminController.getCustomerById.bind(adminController)
);
router.get(
    '/customers/active',
    adminController.findActiveCustomers.bind(adminController)
);
router.get(
    '/customers/search',
    adminController.findCustomerByAttribute.bind(adminController)
);
router.get('/customers', adminController.getAllCustomers.bind(adminController));

router.get('/admins/:id', adminController.getAdminById.bind(adminController));
router.get('/admins', adminController.getAdminsByRole.bind(adminController));
router.get('/admins', adminController.getAllAdmins.bind(adminController));

router.patch(
    '/admins/:id/role',
    adminController.setAdminRole.bind(adminController)
);

export default router;
