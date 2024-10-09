import { query, body, param, ValidationChain } from 'express-validator';

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

export const validateAdminUsername = (): ValidationChain[] => [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .matches(/^[a-zA-Z0-9._-]+$/)
        .withMessage(
            'Username must contain only letters, numbers, underscores, dots, or hyphens'
        ),
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

export const validateId = (): ValidationChain[] => [
    param('id')
        .notEmpty()
        .withMessage('Id is required')
        .isInt({ min: 1 })
        .withMessage('Id must be a positive integer'),
];
