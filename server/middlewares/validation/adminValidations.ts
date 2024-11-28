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
        .isIn(['firstName', 'lastName', 'username', 'email'])
        .withMessage('Attribute must be a valid user attribute')
        .isLength({ max: 16 })
        .withMessage('Attribute must be no longer than 16 characters'),

    query('value')
        .trim()
        .notEmpty()
        .withMessage('Value is required')
        .isLength({ max: 320 })
        .withMessage('Attribute must be no longer than 320 characters'),
];
