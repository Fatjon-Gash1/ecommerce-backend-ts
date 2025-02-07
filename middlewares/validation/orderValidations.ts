import { body, query, ValidationChain } from 'express-validator';

export const validateOrderCreation = (): ValidationChain[] => [
    body('items')
        .isArray({ min: 1 })
        .withMessage(
            'Items array is required and should contain at least one item'
        )
        .bail(),

    body('items.*.productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive number'),

    body('items.*.quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive number'),

    body('paymentMethod')
        .trim()
        .notEmpty()
        .withMessage('Payment method is required')
        .toLowerCase()
        .isIn(['card', 'wallet', 'bank-transfer'])
        .withMessage(
            'Payment method must be either card, wallet or bank-transfer'
        ),
];

export const validateOrderStatus = (): ValidationChain[] => [
    query('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .toLowerCase()
        .isIn(['pending', 'delivered', 'canceled'])
        .withMessage('Status must be either pending, delivered or canceled'),
];
