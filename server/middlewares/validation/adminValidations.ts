import { query, body, ValidationChain } from 'express-validator';

export const validateAdminRole = (): ValidationChain[] => [
    query('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'manager'])
        .withMessage('Invalid role'),
];

export const validateAdminRoleSet = (): ValidationChain[] => [
    body('role')
        .notEmpty()
        .withMessage('Role number is required')
        .isInt()
        .withMessage('Role must be a valid integer')
        .isIn([1, 2])
        .withMessage('Invalid role number'),
];

export const validateAttribute = (): ValidationChain[] => [
    query('attribute')
        .trim()
        .notEmpty()
        .withMessage('Attribute is required')
        .isLength({ max: 16 })
        .withMessage('Attribute must be 16 characters or less'),

    query('value')
        .trim()
        .notEmpty()
        .withMessage('Value is required')
        .isLength({ max: 32 })
        .withMessage('Value must be 32 characters or less'),
];
