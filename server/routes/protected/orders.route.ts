import { Router } from 'express';
import { OrderController } from '../../controllers/Order.controller';
import { OrderService } from '../../services';
import {
    validateOrderCreation,
    validateId,
    validationErrors,
} from '../../middlewares/validation';

const router: Router = Router();
const orderController = new OrderController(new OrderService());

router.post(
    '/',
    validateOrderCreation(),
    validationErrors,
    orderController.createOrder.bind(orderController)
);

router.get(
    '/:id/items/total',
    validateId(),
    validationErrors,
    orderController.getTotalPriceOfOrderItems.bind(orderController)
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
router.get(
    '/delivered',
    orderController.getDeliveredOrders.bind(orderController)
);
router.get('/pending', orderController.getPendingOrders.bind(orderController));
router.get(
    '/canceled',
    orderController.getCanceledOrders.bind(orderController)
);
router.get('/history', orderController.getOrderHistory.bind(orderController));

router.patch(
    '/:id',
    validateId(),
    validationErrors,
    orderController.cancelOrder.bind(orderController)
);

export default router;
