import rateLimit from 'express-rate-limit';

export const ratingDeletionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        status: 429,
        error: 'Too many rating deletion attempts, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
