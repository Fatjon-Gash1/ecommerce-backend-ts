import { Router } from 'express';
import { PaymentController } from '../../controllers/Payment.controller';
import { PaymentService } from '../../services';

const router: Router = Router();
const paymentService = new PaymentService(process.env.STRIPE_KEY as string);
const paymentController = new PaymentController(paymentService);

router.post(
    '/customer/:id',
    paymentController.findOrCreateCustomer.bind(paymentController)
);

router.post(
    '/payment-intent',
    paymentController.createPaymentIntent.bind(paymentController)
);

router.get(
    '/payment-intent/:id',
    paymentController.getPaymentIntent.bind(paymentController)
);

export default router;
