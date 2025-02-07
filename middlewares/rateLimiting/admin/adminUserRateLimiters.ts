import rateLimit from 'express-rate-limit';

export const registerRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        error: 'Too many registration requests, please try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const userDeletionRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        error: 'Too many user deletion requests, please try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
