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
import authorizeMembership from '@/middlewares/authorization/membershipAuthorize';

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
    '/memberships/confirm',
    subscriptionController.subscribeToNewMembershipPrice.bind(
        subscriptionController
    )
);
router.post(
    '/replenishments',
    authorizeMembership(['premium']),
    validateReplenishment(),
    validationErrors,
    subscriptionController.createReplenishment.bind(subscriptionController)
);

router.get(
    '/replenishments/:id',
    authorizeMembership(['premium']),
    validateId(),
    validationErrors,
    subscriptionController.getReplenishmentById.bind(subscriptionController)
);
router.get(
    '/replenishments',
    authorizeMembership(['premium']),
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
    authorizeMembership(['premium']),
    replenishmentUpdateRateLimiter,
    validateId(),
    validateReplenishment(),
    validationErrors,
    subscriptionController.updateReplenishment.bind(subscriptionController)
);
router.put(
    '/replenishments/:id/toggle-cancel',
    authorizeMembership(['premium']),
    replenishmentCancelToggleRateLimiter,
    validateId(),
    validationErrors,
    subscriptionController.toggleCancelStatusOnReplenishment.bind(
        subscriptionController
    )
);

router.delete(
    '/replenishments/:id',
    authorizeMembership(['premium']),
    validateId(),
    validationErrors,
    subscriptionController.removeReplenishment.bind(subscriptionController)
);

export default router;
