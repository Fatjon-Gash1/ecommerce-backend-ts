import { body, query, ValidationChain } from 'express-validator';

export const validatePurchaseData = (): ValidationChain[] => [
    body('orderItems')
        .notEmpty()
        .withMessage('Order items are required')
        .isArray()
        .withMessage('An array of order items is required'),

    body('orderItems.*.productId')
        .notEmpty()
        .withMessage('A product id is required')
        .isInt({ min: 1 })
        .withMessage('Product id must be a positive number'),

    body('orderItems.*.quantity')
        .notEmpty()
        .withMessage('Product quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive number'),

    body('shippingCountry')
        .notEmpty()
        .withMessage('Shipping country is required')
        .isString()
        .withMessage('Shipping country must be a string'),

    body('shippingMethod')
        .notEmpty()
        .withMessage('Shipping method is required')
        .isIn(['standard', 'express', 'next-day'])
        .withMessage(
            'Shipping method must be either "standard", "express" or "next-day"'
        ),

    body('currency')
        .notEmpty()
        .withMessage('Currency is required')
        .isIn(['usd', 'eur'])
        .withMessage('Currency must be either "usd" or "eur"'),

    body('paymentMethodType')
        .notEmpty()
        .withMessage('Payment method is required')
        .equals('card')
        .withMessage('Payment method must be "card"'),

    body('paymentMethodId')
        .optional()
        .isString()
        .withMessage('Payment method must be a string'),

    body('loyaltyPoints')
        .optional()
        .custom((value) => {
            return value % 50 === 0;
        })
        .withMessage('Loyalty points must be a multiple of 50'),
];

export const validateRefundRequest = (): ValidationChain[] => [
    body('reason').trim().notEmpty().withMessage('Reason is required'),

    body('amount')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Amount must be a positive number'),
];

export const validateRefundRequestHandling = (): ValidationChain[] => [
    body('action')
        .trim()
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['approved', 'denied'])
        .withMessage('Action must be either "approved" or "denied"'),

    body('rejectionReason')
        .optional()
        .isString()
        .withMessage('Rejection reason must be a string'),
];

export const validateRefundRequestFiltering = (): ValidationChain[] => [
    query('customerId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive number'),

    query('status')
        .optional()
        .trim()
        .isIn(['pending', 'approved', 'denied'])
        .withMessage('Status must be either "pending", "approved" or "denied"'),
];
