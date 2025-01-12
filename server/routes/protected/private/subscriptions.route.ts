import { Router } from 'express';
import { SubscriptionController } from '../../../controllers/Subscription.controller';
import {
    SubscriptionService,
    PaymentService,
    AdminLogsService,
} from '../../../services';

const router: Router = Router();
const subscriptionService = new SubscriptionService(
    new PaymentService(process.env.STRIPE_KEY as string)
);
const subscriptionController = new SubscriptionController(
    subscriptionService,
    new AdminLogsService()
);

router.get(
    '/memberships',
    subscriptionController.getMemberships.bind(subscriptionController)
);

router.patch(
    '/memberships/:id',
    subscriptionController.updateMembershipById.bind(subscriptionController)
);

router.put(
    '/memberships/:id',
    subscriptionController.updateMembershipById.bind(subscriptionController)
);

export default router;
