import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default function authenticateAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authorizationHeader = req.header('Authorization');
    const accessToken = authorizationHeader?.split(' ')[1];
    console.log('Access token:', accessToken);

    if (!accessToken) {
        res.status(401).json({
            message: 'Access denied. Access token missing',
        });
        return;
    }

    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_KEY as string,
        (
            err: jwt.VerifyErrors | null,
            decoded: string | JwtPayload | undefined
        ): void => {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    res.status(401).json({
                        message: `Access token expired at: ${err.expiredAt}`,
                    });
                    return;
                }
                if (err instanceof jwt.JsonWebTokenError) {
                    console.log('Denied access token: ', accessToken);
                    res.status(403).json({ message: 'Permission denied' });
                    return;
                }
            }

            if (decoded) {
                req.user = decoded;
                next();
            } else {
                res.status(400).json({ message: 'Invalid access token' });
            }
        }
    );
}
