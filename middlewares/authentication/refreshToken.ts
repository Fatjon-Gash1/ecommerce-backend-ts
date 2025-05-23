import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare module 'express-serve-static-core' {
    interface Request {
        user?: string | JwtPayload;
        data?: string | JwtPayload;
    }
}

export default function authenticateRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
): void | Response {
    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) {
        return res.status(401).json({
            message: 'Access denied. Refresh token missing',
        });
    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY as string,
        (
            err: jwt.VerifyErrors | null,
            decoded: string | JwtPayload | undefined
        ): void | Response => {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    const expiredAtDate = err.expiredAt
                        .toISOString()
                        .split('T')[0];
                    return res.status(401).json({
                        message: `Refresh token expired at: ${expiredAtDate}`,
                    });
                }
                if (err instanceof jwt.JsonWebTokenError) {
                    return res
                        .status(403)
                        .json({ message: 'Permission denied' });
                }
            }

            if (decoded) {
                req.user = decoded;
                next();
            } else {
                return res
                    .status(400)
                    .json({ message: 'Invalid refresh token' });
            }
        }
    );
}
