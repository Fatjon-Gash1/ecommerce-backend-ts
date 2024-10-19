import { body, ValidationChain } from 'express-validator';

export const validateOrderCreation = (): ValidationChain[] => [
    body('items.productId')
        .trim()
        .notEmpty()
        .withMessage('Product ID is required')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive number'),

    body('items.quantity')
        .trim()
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive number'),

    body('paymentMethod')
        .trim()
        .notEmpty()
        .withMessage('Payment method is required')
        .isAlpha()
        .withMessage('Payment method must contain only letters'),
];
