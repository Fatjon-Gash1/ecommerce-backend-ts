import rateLimit from 'express-rate-limit';

export const ratingUpdateRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: {
        status: 429,
        error: 'Too many rating update attempts, please try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
