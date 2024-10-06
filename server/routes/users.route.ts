import { Router } from 'express';
import { UserController } from '../controllers/User.controller';
import { UserService, NotificationService } from '../services';
import authenticateRefreshToken from '../middlewares/authentication/refreshToken';
import authenticateAccessToken from '../middlewares/authentication/accessToken';
import authorize from '../middlewares/authorization/authorize';
import adminRoutes from './admins.route';

const router: Router = Router();
const userService = new UserService();
const notificationService = new NotificationService();
const userController = new UserController(userService, notificationService);

router.post('/auth/signup', userController.signUpUser.bind(userController));
router.post('/auth/login', userController.loginUser.bind(userController));
router.post(
    '/auth/tokens',
    authenticateRefreshToken,
    userController.generateTokens.bind(userController)
);
router.post(
    '/auth/logout',
    authenticateAccessToken,
    userController.logoutUser.bind(userController)
);

router.get(
    '/availability',
    userController.checkUserAvailability.bind(userController)
);
router.get(
    '/customers/profile',
    authenticateAccessToken,
    userController.getCustomerProfile.bind(userController)
);

router.patch(
    '/password',
    authenticateAccessToken,
    userController.changePassword.bind(userController)
);
router.patch(
    '/customers/customer-details',
    authenticateAccessToken,
    authorize('customer'),
    userController.updateCustomerDetails.bind(userController)
);
router.patch(
    '/',
    authenticateAccessToken,
    userController.updateUser.bind(userController)
);

router.delete(
    '/',
    authenticateAccessToken,
    userController.deleteUser.bind(userController)
);

router.use('/admin', authenticateAccessToken, authorize('admin'), adminRoutes);

export default router;
