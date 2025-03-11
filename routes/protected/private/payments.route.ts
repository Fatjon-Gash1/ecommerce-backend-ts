import { Router } from 'express';
import { PaymentController } from '@/controllers/Payment.controller';
import { PaymentService, NotificationService } from '@/services';
import { checkExact } from 'express-validator';
import {
    validationErrors,
    validateId,
    validateRefundRequestHandling,
    validateRefundRequestFiltering,
} from '@/middlewares/validation';

const router: Router = Router();
const paymentService = new PaymentService(
    process.env.STRIPE_KEY as string,
    undefined,
    undefined,
    new NotificationService()
);
const paymentController = new PaymentController(paymentService);

router.post(
    '/refund-requests/:id/handle',
    validateId(),
    validateRefundRequestHandling(),
    validationErrors,
    paymentController.handleRefundRequest.bind(paymentController)
);

router.get(
    '/refund-requests',
    validateRefundRequestFiltering(),
    validationErrors,
    paymentController.getRefundRequests.bind(paymentController)
);

export default router;
