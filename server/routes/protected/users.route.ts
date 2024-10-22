import { Router } from 'express';
import { UserController } from '../../controllers/User.controller';
import { UserService, NotificationService } from '../../services';
import authenticateRefreshToken from '../../middlewares/authentication/refreshToken';
import authenticateAccessToken from '../../middlewares/authentication/accessToken';
import authorize from '../../middlewares/authorization/authorize';
import {
    signupRateLimiter,
    loginRateLimiter,
    tokenRateLimiter,
    updateRateLimiter,
    passwordChangeRateLimiter,
} from '../../middlewares/rateLimiting';
import {
    validateRegistration,
    validateLogIn,
    validateAvailability,
    validatePasswords,
    validateCustomerDetails,
    validateUserUpdateDetails,
    validationErrors,
} from '../../middlewares/validation';
import cartRoutes from './carts.route';
import orderRoutes from './orders.route';
import shippingRoutes from './shippings.route';
import adminRoutes from './private/admins.route';

const router: Router = Router();
const userController = new UserController(
    new UserService(),
    new NotificationService()
);

router.post(
    '/auth/signup',
    signupRateLimiter,
    validateRegistration(),
    validationErrors,
    userController.signUpUser.bind(userController)
);
router.post(
    '/auth/login',
    loginRateLimiter,
    validateLogIn(),
    validationErrors,
    userController.loginUser.bind(userController)
);
router.post(
    '/auth/tokens',
    authenticateRefreshToken,
    tokenRateLimiter,
    userController.generateTokens.bind(userController)
);
router.post(
    '/auth/logout',
    authenticateAccessToken,
    userController.logoutUser.bind(userController)
);

router.get(
    '/availability',
    validateAvailability(),
    validationErrors,
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
    passwordChangeRateLimiter,
    validatePasswords(),
    validationErrors,
    userController.changePassword.bind(userController)
);
router.patch(
    '/customers/customer-details',
    authenticateAccessToken,
    updateRateLimiter,
    authorize(['customer']),
    validateCustomerDetails(),
    validationErrors,
    userController.updateCustomerDetails.bind(userController)
);
router.patch(
    '/',
    authenticateAccessToken,
    updateRateLimiter,
    validateUserUpdateDetails(),
    validationErrors,
    userController.updateUser.bind(userController)
);

router.delete(
    '/',
    authenticateAccessToken,
    userController.deleteAccount.bind(userController)
);

router.use(
    '/customers/cart',
    authenticateAccessToken,
    authorize(['customer']),
    cartRoutes
);

router.use(
    '/customers/orders',
    authenticateAccessToken,
    authorize(['customer']),
    orderRoutes
);

router.use('/shippings', authenticateAccessToken, shippingRoutes);

router.use(
    '/admin',
    authenticateAccessToken,
    authorize(['admin', 'manager']),
    adminRoutes
);

export default router;
