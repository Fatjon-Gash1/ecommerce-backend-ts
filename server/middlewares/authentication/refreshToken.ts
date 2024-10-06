import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare module 'express-serve-static-core' {
    interface Request {
        user?: string | JwtPayload;
    }
}

export default function authenticateRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const refreshToken = req.cookies.refreshToken as string;
    console.log('Refresh token:', refreshToken);

    if (!refreshToken) {
        res.status(401).json({
            message: 'Access denied. Refresh token missing',
        });
        return;
    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY as string,
        (
            err: jwt.VerifyErrors | null,
            decoded: string | JwtPayload | undefined
        ): void => {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    res.status(401).json({
                        message: `Refresh token expired at: ${err.expiredAt}`,
                    });
                    return;
                }
                if (err instanceof jwt.JsonWebTokenError) {
                    console.log('Denied refresh token: ', refreshToken);
                    res.status(403).json({ message: 'Permission denied' });
                    return;
                }
            }

            if (decoded) {
                req.user = decoded;
                next();
            } else {
                res.status(400).json({ message: 'Invalid refresh token' });
            }
        }
    );
}
