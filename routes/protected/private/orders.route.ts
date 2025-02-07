import { Router } from 'express';
import { OrderController } from '../../../controllers/Order.controller';
import { OrderService, AdminLogsService } from '../../../services';
import {
    validateId,
    validateOrderStatus,
    validationErrors,
} from '../../../middlewares/validation';

const router: Router = Router();
const orderController = new OrderController(
    new OrderService(),
    new AdminLogsService()
);

router.get('/', orderController.getAllOrders.bind(orderController));
router.get(
    '/search',
    validateOrderStatus(),
    validationErrors,
    orderController.getOrdersByStatus.bind(orderController)
);
router.get(
    '/:customerId/search',
    validateId('customerId'),
    validateOrderStatus(),
    validationErrors,
    orderController.getCustomerOrdersByStatus.bind(orderController)
);
router.get(
    '/:customerId/history',
    validateId('customerId'),
    validationErrors,
    orderController.getCustomerOrderHistory.bind(orderController)
);
router.get(
    '/:id',
    validateId(),
    validationErrors,
    orderController.getOrderById.bind(orderController)
);
router.get(
    '/:id/items',
    validateId(),
    validationErrors,
    orderController.getOrderItemsByOrderId.bind(orderController)
);

router.patch(
    '/:id/mark-delivered',
    validateId(),
    validationErrors,
    orderController.markAsDelivered.bind(orderController)
);

export default router;
