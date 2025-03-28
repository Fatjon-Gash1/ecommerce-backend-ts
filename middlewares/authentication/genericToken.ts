import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redisClient } from '@/config/redis';

export default async function authenticateGenericToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    try {
        const authorizationHeader = req.header('Authorization');
        const genericToken = authorizationHeader?.split(' ')[1];

        if (!genericToken) {
            return res.status(401).json({
                message: 'Cannot proceed. Token missing',
            });
        }

        await redisClient.zremrangebyscore(
            'blacklisted:tokens',
            '-inf',
            Date.now()
        );

        const blacklisted = await redisClient.zscore(
            'blacklisted:tokens',
            genericToken
        );

        if (blacklisted) {
            return res.status(400).json({
                message:
                    'The token cannot be used anymore. Either it has been used or it was invalidated.',
            });
        }

        const decoded = jwt.verify(
            genericToken,
            process.env.GENERIC_TOKEN_KEY!
        );

        await redisClient.zadd(
            'blacklisted:tokens',
            Date.now() + 900000,
            genericToken
        );

        req.data = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: `Token expired at: ${error.expiredAt}`,
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
}
