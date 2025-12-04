import { redisClient } from '@/config/redis';
import MembershipCancellationQueue from './membership-cancellation.queue';
import BirthdayPromoQueue from './birthday-promo.queue';
import HolidayPromoQueue from './holiday-promo.queue';
import ExclusiveProductRemovalQueue from './exclusive-product.queue';
import SupportAgentDetachmentQueue from './support-agent.queue';

const baseJobOptions = {
    attempts: 5, // 2^(1->2->3->4->*5(-1)) * 5000 | executions: 10000ms, 10000ms, 20000ms, 40000ms, 80000ms
    backoff: {
        type: 'exponential',
        delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 },
};

export const membershipCancellationQueue = new MembershipCancellationQueue(
    baseJobOptions,
    redisClient
);

export const birthdayPromoQueue = new BirthdayPromoQueue(
    baseJobOptions,
    redisClient
);

export const holidayPromoQueue = new HolidayPromoQueue(
    baseJobOptions,
    redisClient
);

export const exclusiveProductRemovalQueue = new ExclusiveProductRemovalQueue(
    baseJobOptions,
    redisClient
);

export const supportAgentDetachmentQueue = new SupportAgentDetachmentQueue(
    baseJobOptions,
    redisClient
);

membershipCancellationQueue.listen();
birthdayPromoQueue.listen();
holidayPromoQueue.listen();
exclusiveProductRemovalQueue.listen();
supportAgentDetachmentQueue.listen();
