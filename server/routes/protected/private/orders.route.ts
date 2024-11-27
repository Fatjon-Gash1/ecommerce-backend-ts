import { Router } from 'express';
import { OrderController } from '../../../controllers/Order.controller';
import { OrderService, AdminLogsService } from '../../../services';
import {
    validateId,
    validateQuery,
    validationErrors,
} from '../../../middlewares/validation';

const router: Router = Router();
const orderController = new OrderController(
    new OrderService(),
    new AdminLogsService()
);

router.get('/', orderController.getAllOrders.bind(orderController));
router.get(
    '/:userId/',
    validateId('userId'),
    validateQuery('status'),
    validationErrors,
    orderController.getOrdersByStatus.bind(orderController)
);
router.get(
    '/:userId/history',
    validateId('userId'),
    validationErrors,
    orderController.getOrderHistory.bind(orderController)
);
router.get(
    '/:id/items',
    validateId(),
    validationErrors,
    orderController.getOrderItemsByOrderId.bind(orderController)
);
router.get(
    '/:id',
    validateId(),
    validationErrors,
    orderController.getOrderById.bind(orderController)
);

router.patch(
    '/mark-as-delivered',
    validateId(),
    validationErrors,
    orderController.markAsDelivered.bind(orderController)
);

// Another route to get orders by status via id

export default router;
