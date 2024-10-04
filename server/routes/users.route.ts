import { Router } from 'express';
import { UserController } from '../controllers/User.controller';
import {
    UserService,
    NotificationService,
    AdminLogsService,
} from '../services';
const userService = new UserService();
const notificationService = new NotificationService();
const adminLogsService = new AdminLogsService();
const userController = new UserController(
    userService,
    notificationService,
    adminLogsService
);
const router: Router = Router();

router.post('/auth/signup', userController.signUpUser.bind(userController));
router.post('/auth/login', userController.loginUser.bind(userController));

router.post(
    '/admin/customer',
    userController.registerCustomer.bind(userController)
);
router.post('/admin/admin', userController.registerAdmin.bind(userController));

router.get(
    '/customers/:id',
    userController.getCustomerById.bind(userController)
);
router.get(
    '/customers/active',
    userController.findActiveCustomers.bind(userController)
);
router.get(
    '/customers/search',
    userController.findCustomerByAttribute.bind(userController)
);
router.get('/customers', userController.getAllCustomers.bind(userController));

router.get('/admins/:id', userController.getAdminById.bind(userController));
router.get(
    '/admins/search',
    userController.getAdminsByRole.bind(userController)
);
router.get('/admins', userController.getAllAdmins.bind(userController));

// User type independent route
router.get(
    '/availability',
    userController.checkUserAvailability.bind(userController)
);

router.put('/:id/password', userController.changePassword.bind(userController));
router.put('/:id/', userController.updateUser.bind(userController));

router.put(
    '/admins/:id/role',
    userController.setAdminRole.bind(userController)
);

router.put(
    '/customers/:id/shipping-details',
    userController.addShippingDetails.bind(userController)
);

router.put(
    '/customers/:id/clear-shipping-details',
    userController.removeShippingDetails.bind(userController)
);

router.delete('/:id', userController.deleteUser.bind(userController));

export default router;
