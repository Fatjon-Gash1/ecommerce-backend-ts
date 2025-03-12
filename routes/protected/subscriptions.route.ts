import { Router } from 'express';
import {
    SubscriptionService,
    ReplenishmentService,
    NotificationService,
    PaymentService,
} from '@/services';
import { SubscriptionController } from '@/controllers/Subscription.controller';
import {
    validateId,
    validateMembershipSubscription,
    validateReplenishment,
    validateBoolean,
    validationErrors,
} from '@/middlewares/validation';
import {
    membershipSubscriptionRateLimiter,
    replenishmentUpdateRateLimiter,
    replenishmentCancelToggleRateLimiter,
} from '@/middlewares/rateLimiting';

const router: Router = Router();
const notificationService = new NotificationService();
const subscriptionService = new SubscriptionService(
    new PaymentService(
        process.env.STRIPE_KEY as string,
        undefined,
        undefined,
        notificationService
    ),
    notificationService
);
const replenishmentService = new ReplenishmentService();
const subscriptionController = new SubscriptionController(
    subscriptionService,
    replenishmentService
);
replenishmentService.listenAll();

router.post(
    '/memberships',
    membershipSubscriptionRateLimiter,
    validateMembershipSubscription(),
    validationErrors,
    subscriptionController.createMembershipSubscription.bind(
        subscriptionController
    )
);
router.post(
    '/replenishments',
    validateReplenishment(),
    validationErrors,
    subscriptionController.createReplenishment.bind(subscriptionController)
);

router.get(
    '/memberships',
    subscriptionController.getMemberships.bind(subscriptionController)
);
router.get(
    '/replenishments/:id',
    validateId(),
    validationErrors,
    subscriptionController.getReplenishmentById.bind(subscriptionController)
);
router.get(
    '/replenishments',
    subscriptionController.getCustomerReplenishments.bind(
        subscriptionController
    )
);

router.patch(
    '/memberships/cancel',
    validateBoolean('immediate'),
    validationErrors,
    subscriptionController.cancelMembershipSubscription.bind(
        subscriptionController
    )
);

router.put(
    '/replenishments/:id',
    replenishmentUpdateRateLimiter,
    validateId(),
    validateReplenishment(),
    validationErrors,
    subscriptionController.updateReplenishment.bind(subscriptionController)
);
router.put(
    '/replenishments/:id/toggle-cancel',
    replenishmentCancelToggleRateLimiter,
    validateId(),
    validationErrors,
    subscriptionController.toggleCancelStatusOnReplenishment.bind(
        subscriptionController
    )
);

router.delete(
    '/replenishments/:id',
    validateId(),
    validationErrors,
    subscriptionController.removeReplenishment.bind(subscriptionController)
);

export default router;
