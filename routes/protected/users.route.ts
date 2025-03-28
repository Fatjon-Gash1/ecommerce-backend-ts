import { Router } from 'express';
import { UserController } from '@/controllers/User.controller';
import { UserService, PaymentService, NotificationService } from '@/services';
import authenticateRefreshToken from '@/middlewares/authentication/refreshToken';
import authenticateAccessToken from '@/middlewares/authentication/accessToken';
import authenticateGenericToken from '@/middlewares/authentication/genericToken';
import authorize from '@/middlewares/authorization/authorize';
import {
    signupRateLimiter,
    loginRateLimiter,
    tokenRateLimiter,
    updateRateLimiter,
    passwordChangeRateLimiter,
    passwordResetRequestRateLimiter,
} from '@/middlewares/rateLimiting';
import {
    validateRegistration,
    validateLogIn,
    validateAvailability,
    validatePasswords,
    validateCustomerDetails,
    validateUserUpdateDetails,
    validationErrors,
    validatePassword,
    validateEmail,
} from '@/middlewares/validation';
import cartRoutes from './carts.route';
import paymentRoutes from './payments.route';
import orderRoutes from './orders.route';
import shippingRoutes from './shippings.route';
import ratingRoutes from './ratings.route';
import adminRoutes from './private/admins.route';
import subscriptionRoutes from './subscriptions.route';

const router: Router = Router();
const userService = new UserService(
    new PaymentService(process.env.STRIPE_KEY as string),
    new NotificationService()
);
const userController = new UserController(userService);

/**
 * @swagger
 * /users/auth/verify-user:
 *   post:
 *     tags:
 *       - Users
 *     description: Sends an email verification to the user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               details:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Invalid request
 *       409:
 *         description: Customer already exists
 *       500:
 *         description: Server error
 */
router.post(
    '/auth/verify-user',
    signupRateLimiter,
    validateRegistration(),
    validationErrors,
    userController.verifyUser.bind(userController)
);
/**
 * @swagger
 * /users/auth/signup:
 *   post:
 *     tags:
 *       - Users
 *     description: User signup
 *     responses:
 *       200:
 *         description: Signup successful
 *       400:
 *         description: Invalid request
 *       409:
 *         description: Customer already exists
 *       500:
 *         description: Server error
 */
router.post(
    '/auth/signup',
    authenticateGenericToken,
    userController.signUpCustomer.bind(userController)
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
router.post(
    '/auth/request-password-reset',
    passwordResetRequestRateLimiter,
    validateEmail(),
    validationErrors,
    userController.requestPasswordReset.bind(userController)
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
    authorize(['customer']),
    userController.getCustomerProfile.bind(userController)
);

router.patch(
    '/auth/change-password',
    authenticateAccessToken,
    passwordChangeRateLimiter,
    validatePasswords(),
    validationErrors,
    userController.changePassword.bind(userController)
);
router.patch(
    '/auth/reset-password',
    authenticateGenericToken,
    validatePassword(),
    validationErrors,
    userController.resetPassword.bind(userController)
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
    '/customers/payments',
    authenticateAccessToken,
    authorize(['customer']),
    paymentRoutes
);

router.use(
    '/customers/orders',
    authenticateAccessToken,
    authorize(['customer']),
    orderRoutes
);

router.use(
    '/customers/subscriptions',
    authenticateAccessToken,
    authorize(['customer']),
    subscriptionRoutes
);

router.use('/shippings', authenticateAccessToken, shippingRoutes);

router.use(
    '/ratings',
    authenticateAccessToken,
    authorize(['customer']),
    ratingRoutes
);

router.use(
    '/admin',
    authenticateAccessToken,
    authorize(['admin', 'manager']),
    adminRoutes
);

export default router;
