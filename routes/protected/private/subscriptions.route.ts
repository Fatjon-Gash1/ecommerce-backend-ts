import { Router } from 'express';
import { SubscriptionController } from '@/controllers/Subscription.controller';
import {
    SubscriptionService,
    ReplenishmentService,
    PaymentService,
    NotificationService,
    AdminLogsService,
} from '@/services';

const router: Router = Router();
const subscriptionService = new SubscriptionService(
    new PaymentService(process.env.STRIPE_KEY as string),
    new NotificationService()
);
const subscriptionController = new SubscriptionController(
    subscriptionService,
    new ReplenishmentService('partial'),
    new AdminLogsService()
);

router.get(
    '/memberships',
    subscriptionController.getMembershipSubscriptions.bind(
        subscriptionController
    )
);
router.get(
    '/replenishments',
    subscriptionController.getAllReplenishments.bind(subscriptionController)
);

router.patch(
    '/memberships/:id/change-price',
    subscriptionController.changeMembershipPrice.bind(subscriptionController)
);

export default router;
