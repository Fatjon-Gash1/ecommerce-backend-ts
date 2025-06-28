import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export default function authorizeMembership(membershipTypes: string[]) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void | Response => {
        if (req.user && typeof req.user !== 'string') {
            const userType = (req.user as JwtPayload).type;

            if (userType !== 'customer') {
                return res.status(403).json({ message: 'Access denied' });
            } else {
                const membership = (req.user as JwtPayload).membership;

                if (!membershipTypes.includes(membership)) {
                    return res.status(403).json({ message: 'Access allowed only for: ' + membershipTypes.toString() + ' memberships' });
                }
            }

            next();
        } else {
            return res.status(400).json({ message: 'Invalid decoded data' });
        }
    };
}
