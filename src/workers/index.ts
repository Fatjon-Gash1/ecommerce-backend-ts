import { workerRedisClient } from '@/config/redis';
import {
    SubscriptionService,
    NotificationService,
    PaymentService,
    ProductService,
    LoggingService,
} from '@/services';
import MembershipCancellationWorker from './membership-cancellation.worker';
import BirthdayPromoWorker from './birthday-promo.worker';
import HolidayPromoWorker from './holiday-promo.worker';
import ExclusiveProductRemovalWorker from './exclusive-product-removal.worker';
import SupportAgentDetachmentWorker from './support-agent-detachment.worker';

const subscriptionService = new SubscriptionService();
const notificationService = new NotificationService();
const paymentService = new PaymentService(process.env.STRIPE_KEY);
const productService = new ProductService();
const loggingService = new LoggingService();

const membershipCancellationWorker = new MembershipCancellationWorker(
    subscriptionService,
    notificationService,
    workerRedisClient
);

const birthdayPromoWorker = new BirthdayPromoWorker(
    paymentService,
    notificationService,
    workerRedisClient
);

const holidayPromoWorker = new HolidayPromoWorker(
    paymentService,
    notificationService,
    workerRedisClient
);

const exclusiveProductRemovalWorker = new ExclusiveProductRemovalWorker(
    productService,
    loggingService,
    workerRedisClient
);

const supportAgentDetachmentWorker = new SupportAgentDetachmentWorker(
    loggingService,
    workerRedisClient
);

membershipCancellationWorker.listen();
birthdayPromoWorker.listen();
holidayPromoWorker.listen();
exclusiveProductRemovalWorker.listen();
supportAgentDetachmentWorker.listen();
