import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export default function authorize(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && typeof req.user !== 'string') {
            const userRole = (req.user as JwtPayload).role;

            if (userRole !== requiredRole) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }

            next();
        } else {
            res.status(400).json({ message: 'Invalid decoded data' });
        }
    };
}
