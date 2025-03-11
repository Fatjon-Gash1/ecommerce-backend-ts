import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default function authenticateAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
): void | Response {
    const authorizationHeader = req.header('Authorization');
    const accessToken = authorizationHeader?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({
            message: 'Access denied. Access token missing',
        });
    }

    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_KEY as string,
        (
            err: jwt.VerifyErrors | null,
            decoded: string | JwtPayload | undefined
        ): void | Response => {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    return res.status(401).json({
                        message: `Access token expired at: ${err.expiredAt}`,
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
                    .json({ message: 'Invalid access token' });
            }
        }
    );
}
