import { check, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateSetAdminRole = [
    check('id')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),

    check('roleNumber')
        .isInt({ min: 1, max: 3 })
        .withMessage('Role number must be an integer between 1 and 3'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
