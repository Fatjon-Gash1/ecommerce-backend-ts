import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redisClient } from '@/config/redis';

export default async function authenticatePasswordResetToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    try {
        const resetToken = req.query['token']?.toString();

        if (!resetToken) {
            return res.status(401).json({
                message: 'Cannot reset password. Reset token missing',
            });
        }

        await redisClient.zremrangebyscore(
            'blacklistedTokens',
            '-inf',
            Date.now()
        );

        const blacklisted = await redisClient.zscore(
            'blacklistedTokens',
            resetToken
        );

        if (blacklisted) {
            return res
                .status(400)
                .json({ message: 'The token has already been used' });
        }

        const decoded = jwt.verify(resetToken, process.env.GENERIC_TOKEN_KEY!);

        await redisClient.zadd(
            'blacklistedTokens',
            Date.now() + 900000,
            resetToken
        );

        req.data = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: `Reset token expired at: ${error.expiredAt}`,
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
}
