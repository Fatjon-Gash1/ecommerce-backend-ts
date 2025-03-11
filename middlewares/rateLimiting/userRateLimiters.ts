import rateLimit from 'express-rate-limit';

export const signupRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        status: 429,
        error: 'Too many signup attempts, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    //skip: (req) => req.ip === '192.168.0.28',
});

export const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        status: 429,
        error: 'Too many login attempts, please try again after 10 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const passwordChangeRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: {
        status: 429,
        error: 'Too many password change attempts. Please try again after 30 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

export const passwordResetRequestRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 30, // Change to 1 after API testing
    message: {
        status: 429,
        error: 'Too many password reset requests. Please try again after 30 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

export const tokenRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 100, // Change to 1 after API testing
    message: {
        status: 429,
        error: 'Token retrieval limit reached, please try again after 30 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const updateRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: {
        status: 429,
        error: 'Too many update attempts, please try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
