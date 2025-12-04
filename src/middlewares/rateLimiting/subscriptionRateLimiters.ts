import rateLimit from 'express-rate-limit';

export const membershipSubscriptionRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 2,
    message: {
        status: 429,
        error: 'Too many membership subscription attempts, please try again after half an hour.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    //skip: (req) => req.ip === '192.168.0.28',
});

export const replenishmentUpdateRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
        status: 429,
        error: 'Too many replenishment update attempts, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.params.id,
});

export const replenishmentCancelToggleRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
        status: 429,
        error: 'Too many replenishment status toggle attempts, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.params.id,
});
