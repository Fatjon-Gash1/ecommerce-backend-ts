import { Router } from 'express';
import { PaymentController } from '@/controllers/Payment.controller';
import {
    PaymentService,
    OrderService,
    ShippingService,
    NotificationService,
} from '@/services';
import {
    validatePurchaseData,
    validateId,
    validateRefundRequest,
    validationErrors,
} from '@/middlewares/validation';
import { checkExact } from 'express-validator';
import authorizeMembership from '@/middlewares/authorization/membershipAuthorize';

const router: Router = Router();
const paymentService = new PaymentService(
    process.env.STRIPE_KEY as string,
    new OrderService(),
    new ShippingService(),
    new NotificationService()
);
const paymentController = new PaymentController(paymentService);

router.post(
    '/payment-details',
    paymentController.addPaymentDetails.bind(paymentController)
);

router.post(
    '/payment-methods/default/:id',
    paymentController.setDefaultPaymentMethod.bind(paymentController)
);
router.post(
    '/refunds/:orderId',
    authorizeMembership(['plus', 'premium']),
    validateId('orderId'),
    validateRefundRequest(),
    validationErrors,
    paymentController.createRefundRequest.bind(paymentController)
);
router.post(
    '/orders',
    validatePurchaseData(),
    checkExact([]),
    validationErrors,
    paymentController.processPaymentAndCreateOrder.bind(paymentController)
);

router.get(
    '/payment-methods',
    paymentController.getPaymentMethods.bind(paymentController)
);
router.get(
    '/payment-methods/:id',
    paymentController.getPaymentMethodById.bind(paymentController)
);
router.get(
    '/refund-requests',
    authorizeMembership(['plus', 'premium']),
    paymentController.getCustomerRefundRequests.bind(paymentController)
);

router.patch(
    '/payment-methods/:id',
    paymentController.updatePaymentMethod.bind(paymentController)
);

router.put(
    '/payment-methods/:id',
    paymentController.updatePaymentMethod.bind(paymentController)
);

router.delete(
    '/payment-methods/:id',
    paymentController.deletePaymentMethod.bind(paymentController)
);

export default router;
