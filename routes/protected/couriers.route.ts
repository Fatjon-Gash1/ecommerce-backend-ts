import { Router } from 'express';
import { CourierController } from '@/controllers/Courier.controller';
import { OrderService, LoggingService, AdminService } from '@/services';
import {
    validateId,
    validationErrors,
    validateOrderStatus,
} from '@/middlewares/validation';

const router: Router = Router();
const courierController = new CourierController(
    new OrderService(),
    new AdminService(),
    new LoggingService()
);

router.get('/profile', courierController.getProfile.bind(courierController));
router.get(
    '/orders/search',
    validateOrderStatus(),
    validationErrors,
    courierController.getOrdersByStatus.bind(courierController)
);
router.get(
    '/managers',
    courierController.getAllManagers.bind(courierController)
);

router.patch(
    '/orders/:id/mark',
    validateId(),
    validationErrors,
    courierController.markOrder.bind(courierController)
);

export default router;
