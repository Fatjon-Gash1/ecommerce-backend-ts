import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export default function authorize(providedRoles: string[]) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void | Response => {
        if (req.user && typeof req.user !== 'string') {
            const userRole = (req.user as JwtPayload).type;

            if (!providedRoles.includes(userRole)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        } else {
            return res.status(400).json({ message: 'Invalid decoded data' });
        }
    };
}
