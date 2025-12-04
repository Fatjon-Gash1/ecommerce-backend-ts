import { Router } from 'express';
import { SubscriptionService } from '@/services';
import { SubscriptionController } from '@/controllers/Subscription.controller';

const router: Router = Router();
const subscriptionController = new SubscriptionController(
    new SubscriptionService()
);

/**
 * @swagger
 * /memberships:
 *   get:
 *     tags:
 *       - Ratings
 *     description: Retrieves customer membership plans.
 *     responses:
 *       200:
 *         description: Successfully retrieved the available membership plans.
 */
router.get(
    '/memberships',
    subscriptionController.getMemberships.bind(subscriptionController)
);

export default router;
