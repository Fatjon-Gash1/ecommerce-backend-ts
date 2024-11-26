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
): void | Response {
    const refreshToken = req.cookies.refreshToken as string;
    console.log('Retrieved Refresh token:', refreshToken);

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
                    console.log(
                        `Expired refresh token (expired at: ${err.expiredAt}): `,
                        refreshToken
                    );
                    return res.status(401).json({
                        message: `Refresh token expired at: ${err.expiredAt}`,
                    });
                }
                if (err instanceof jwt.JsonWebTokenError) {
                    console.log('Denied refresh token: ', refreshToken);
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
