// Document
jest.mock('@/models/document/Holiday.model', () => ({
    find: jest.fn().mockReturnValue({
        select: jest
            .fn()
            .mockReturnValue([
                { name: 'Holiday1', toObject: () => ({ name: 'Holiday1' }) },
            ]),
    }),
}));
jest.mock('@/models/document/ShippingMethod.model', () => ({
    findOne: jest.fn(),
}));
jest.mock('@/models/document/ShippingWeight.model', () => ({
    findOne: jest.fn(),
}));
jest.mock('@/models/document/Membership.model', () => ({
    findOne: jest.fn(),
    findById: jest.fn(),
}));

// Relational
const modelsToMock = [
    'User',
    'Customer',
    'Admin',
    'AdminLog',
    'Category',
    'Product',
    'Cart',
    'Order',
    'ShippingCountry',
    'Payment',
    'Purchase',
    'Replenishment',
    'RefundRequest',
    'Notification',
    'Chatroom',
    'SupportAgent',
    'SupportTicket',
    'Courier',
];

const setMock = () => ({
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn().mockReturnValue({ rows: [{}], count: 1 }),
    count: jest.fn(),
    findOrCreate: jest.fn(),
    update: jest.fn(),
    build: jest.fn().mockReturnValue({
        save: jest.fn().mockResolvedValue(true),
    }),
    destroy: jest.fn(),
    hasOne: jest.fn(),
    hasMany: jest.fn(),
    belongsToMany: jest.fn(),
    belongsTo: jest.fn(),
});

const internalModels = new Map<string, string | string[]>([
    ['Cart', 'CartItem'],
    ['Order', 'OrderItem'],
    ['ShippingCountry', 'ShippingCity'],
    ['Replenishment', 'ReplenishmentPayment'],
    ['Chatroom', ['Message', 'UserChatroom']],
]);

modelsToMock.forEach((modelName) => {
    if (Array.from(internalModels.keys()).includes(modelName)) {
        jest.mock(`@/models/relational/${modelName}.model`, () => {
            const models = {
                [modelName]: setMock(),
            };

            if (Array.isArray(internalModels.get(modelName))) {
                (internalModels.get(modelName) as Array<string>).forEach(
                    (model) => {
                        models[model] = setMock();
                    }
                );
            } else {
                models[internalModels.get(modelName) as string] = setMock();
            }

            return models;
        });
    } else {
        jest.mock(`@/models/relational/${modelName}.model`, () => ({
            [modelName]: setMock(),
        }));
    }
});

jest.mock('@/config/mysql');
jest.mock('@/config/mongodb');
jest.mock('@/config/redis');
jest.mock('@/config/transporter');
jest.mock('@/config/elasticsearch');
jest.mock('@/queues');
jest.mock('@/schedulers');
jest.mock('@/socket/admin');
jest.mock('@/services/Payment.service');
jest.mock('@/services/Notification.service');
jest.mock('@/services/Shipping.service');
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));
jest.mock('stripe', () => {
    return {
        __esModule: true,
        default: class Stripe {
            secretKey: string;

            constructor(secretKey: string) {
                this.secretKey = secretKey;
            }

            customers = {
                retrieve: jest.fn(),
                update: jest.fn(),
            };

            paymentIntents = {
                create: jest.fn(),
            };

            subscriptions = {
                list: jest.fn(),
                update: jest.fn(),
                cancel: jest.fn(),
            };

            invoices = {
                retrieve: jest.fn(),
                finalizeInvoice: jest.fn(),
            };

            refunds = {
                create: jest.fn(),
            };
        },
    };
});
jest.mock('@/logger', () => {
    return {
        __esModule: true,
        Logger: class {
            log = jest.fn();
            error = jest.fn();
        },
        logger: {
            log: jest.fn(),
            error: jest.fn(),
        },
    };
});
jest.mock('bullmq', () => {
    return {
        __esModule: true,
        Queue: jest.fn().mockImplementation(() => ({
            add: jest.fn(),
            close: jest.fn(),
            getJob: jest.fn(),
            getJobs: jest.fn(),
            remove: jest.fn(),
            pause: jest.fn(),
            resume: jest.fn(),
            upsertJobScheduler: jest.fn(),
        })),
    };
});
