import { Router } from 'express';
import {
    AdminService,
    NotificationService,
    OrderService,
    PaymentService,
} from '@/services';
import { SupportAgentController } from '@/controllers/SupportAgent.controller';
import {
    validateId,
    validationErrors,
    validateOrderStatus,
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
const supportAgentController = new SupportAgentController(
    paymentService,
    new OrderService(),
    new AdminService()
);

router.post(
    '/refund-requests/:id/handle',
    validateId(),
    validateRefundRequestHandling(),
    validationErrors,
    supportAgentController.handleRefundRequest.bind(supportAgentController)
);

router.get(
    '/profile',
    supportAgentController.getProfile.bind(supportAgentController)
);
router.get(
    '/refund-requests',
    validateRefundRequestFiltering(),
    validationErrors,
    supportAgentController.getRefundRequests.bind(supportAgentController)
);
router.get(
    '/refund-requests',
    supportAgentController.getCustomerRefundRequests.bind(
        supportAgentController
    )
);
router.get(
    '/customers/profile',
    supportAgentController.getCustomerProfile.bind(supportAgentController)
);
router.get(
    '/customers/:customerId/orders/search',
    validateId('customerId'),
    validateOrderStatus(),
    validationErrors,
    supportAgentController.getCustomerOrdersByStatus.bind(
        supportAgentController
    )
);
router.get(
    '/customers/:customerId/orders/history',
    validateId('customerId'),
    validationErrors,
    supportAgentController.getCustomerOrderHistory.bind(supportAgentController)
);
router.get(
    '/orders/:id',
    validateId(),
    validationErrors,
    supportAgentController.getOrderById.bind(supportAgentController)
);
router.get(
    '/orders/:id/items',
    validateId(),
    validationErrors,
    supportAgentController.getOrderItemsByOrderId.bind(supportAgentController)
);
router.get(
    '/managers',
    supportAgentController.getAllManagers.bind(supportAgentController)
);

export default router;
