import { Router } from 'express';
import { PaymentController } from '../../controllers/Payment.controller';
import { PaymentService } from '../../services';

const router: Router = Router();
const paymentService = new PaymentService(process.env.STRIPE_KEY as string);
const paymentController = new PaymentController(paymentService);

router.post(
    '/payment-details',
    paymentController.addPaymentDetails.bind(paymentController)
);

router.post(
    '/payment-intent',
    paymentController.createPaymentIntent.bind(paymentController)
);
router.post(
    '/payment-intent/:id/refund',
    paymentController.refundPayment.bind(paymentController)
);

router.get(
    '/payment-intents',
    paymentController.getPaymentIntentsForCustomer.bind(paymentController)
);
router.get(
    '/payment-methods',
    paymentController.getPaymentMethods.bind(paymentController)
);
router.get(
    '/payment-methods/:id',
    paymentController.getPaymentMethodById.bind(paymentController)
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
