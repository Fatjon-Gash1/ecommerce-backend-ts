import { body, query, ValidationChain } from 'express-validator';

export const validateMembershipSubscription = (): ValidationChain[] => [
    query('type')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isIn(['plus', 'premium'])
        .withMessage(
            'Invalid membership type. Membership must be either "plus" or "premium"'
        ),

    query('annual').optional().toBoolean(),

    body('promoCode').optional().trim(),
];

export const validateReplenishment = (): ValidationChain[] => [
    body('data')
        .notEmpty()
        .withMessage('Replenishment data is required')
        .isObject()
        .withMessage('Replenishment data must be an object'),

    body('data.orderItems')
        .isArray({ min: 1 })
        .withMessage('Order items must be an array with at least one item'),

    body('data.orderItems.*.productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive number'),

    body('data.orderItems.*.quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive number'),

    body('data.paymentMethod')
        .trim()
        .notEmpty()
        .withMessage('Payment method is required')
        .toLowerCase()
        .equals('card')
        .withMessage('Payment method must be card'),

    body('data.shippingCountry')
        .trim()
        .notEmpty()
        .withMessage('Shipping country is required'),

    body('data.paymentMethodId').optional().trim(),

    body('data.currency')
        .trim()
        .notEmpty()
        .withMessage('Currency is required')
        .toLowerCase()
        .equals('eur')
        .withMessage('Currency must be eur'),

    body('interval')
        .notEmpty()
        .withMessage('Interval is required')
        .isInt({ min: 1, max: 31 })
        .withMessage(
            'Interval must be a positive number and not larger than 31'
        ),

    body('unit')
        .trim()
        .notEmpty()
        .withMessage('Unit is required')
        .toLowerCase()
        .isIn(['day', 'week', 'month', 'year', 'custom'])
        .withMessage('Unit must be a valid period'),

    body('starting')
        .optional()
        .isDate()
        .withMessage('Starting date must be a valid date'),

    body('expiry')
        .optional()
        .isDate()
        .withMessage('Expiry date must be a valid date'),

    body('times')
        .optional()
        .isInt({ min: 1, max: 48 })
        .withMessage('Times must be a positive number and no longer than 48'),
];
