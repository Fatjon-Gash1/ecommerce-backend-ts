import { param, query, ValidationChain } from 'express-validator';

export const validateId = (): ValidationChain[] => [
    param('id')
        .notEmpty()
        .withMessage('Id is required')
        .isInt({ min: 1 })
        .withMessage('Id must be a positive integer'),
];

export const validateQuery = (): ValidationChain[] => [
    query('q')
        .trim()
        .notEmpty()
        .withMessage('Query is required')
        .isLength({ max: 32 })
        .withMessage('Query must be 32 characters or less'),
];
