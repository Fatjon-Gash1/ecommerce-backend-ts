import rateLimit from 'express-rate-limit';

export const categoryCreationRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 50,
    message: {
        status: 429,
        error: 'Too many category creation requests, please try again after 30 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const productCreationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        status: 429,
        error: 'Too many product creation requests, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const categoryUpdateRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        status: 429,
        error: 'Too many category update requests, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const productUpdateRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 200,
    message: {
        status: 429,
        error: 'Too many product update requests, please try again after 10 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const categoryDeletionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        status: 429,
        error: 'Too many category deletion requests, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const productDeletionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        status: 429,
        error: 'Too many product deletion requests, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
