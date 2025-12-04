import rateLimit from 'express-rate-limit';

export const shippingUpdateRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        status: 429,
        error: 'Too many shipping update requests, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
