import { Router } from 'express';
import { OrderController } from '../../controllers/Order.controller';
import { OrderService } from '../../services';
import {
    validateOrderCreation,
    validateId,
    validationErrors,
    validateQuery,
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
    '/',
    validateQuery('status'),
    validationErrors,
    orderController.getOrdersByStatus.bind(orderController)
);
router.get('/history', orderController.getOrderHistory.bind(orderController));
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

router.patch(
    '/:id',
    validateId(),
    validationErrors,
    orderController.cancelOrder.bind(orderController)
);

export default router;
