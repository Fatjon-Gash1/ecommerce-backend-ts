import { query, ValidationChain } from 'express-validator';

export const validatePurchaseFilters = (): ValidationChain[] => [
    query('page')
        .notEmpty()
        .withMessage('Page is required')
        .isInt({ min: 1 })
        .withMessage('Field must be a number and greater than 0'),

    query('page-size')
        .notEmpty()
        .withMessage('Page size is required')
        .isInt({ min: 10 })
        .withMessage('Field must be a number and at least 10'),

    query('sort-by')
        .optional()
        .trim()
        .isIn(['purchaseCount', 'totalRevenue'])
        .withMessage("Field must be either 'purchaseCount' or 'totalRevenue"),

    query('sort-order')
        .optional()
        .trim()
        .isIn(['desc', 'asc'])
        .withMessage("Field must be either 'desc' or 'asc'"),

    query('min-purchases')
        .optional()
        .isInt()
        .withMessage('Field must be a number'),

    query('min-revenue')
        .optional()
        .isInt()
        .withMessage('Field must be a number'),
];

export const validatePagination = (): ValidationChain[] => [
    query('limit').trim().notEmpty().withMessage('A data limit is required'),
];

export const validateProductStatus = (): ValidationChain[] => [
    query('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['instock', 'outofstock', 'lowstock'])
        .withMessage('Invalid status'),
];

export const validateReportNameOrType = (): ValidationChain[] => [
    query('name').optional().trim(),

    query('type')
        .optional()
        .trim()
        .isIn([
            'sales',
            'stock',
            'purchases',
            'orders',
            'customer_purchases',
            'customer_orders',
        ])
        .withMessage('Invalid report type'),
];

export const validateReport = (): ValidationChain[] => [
    query('type')
        .trim()
        .notEmpty()
        .withMessage('Report type is required')
        .isIn([
            'sales',
            'stock',
            'purchases',
            'orders',
            'customer_purchases',
            'customer_orders',
        ])
        .withMessage('Invalid report type'),

    query('status')
        .optional()
        .trim()
        .isIn([
            'pending',
            'shipped',
            'awaiting-pickup',
            'delivered',
            'refunded',
            'partially-refunded',
            'uncollected',
        ])
        .withMessage('Invalid order status'),

    query('customerId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive number'),

    query('interval')
        .optional()
        .isIn(['weekly', 'monthly', 'yearly', 'full'])
        .withMessage('Invalid interval'),
];

export const validateInterval = (): ValidationChain[] => [
    query('interval')
        .optional()
        .isIn(['weekly', 'monthly', 'yearly', 'full'])
        .withMessage('Invalid interval'),
];

export const validateLeads = (): ValidationChain[] => [
    query('leads')
        .notEmpty()
        .withMessage('Leads is required')
        .isInt({ min: 1 })
        .withMessage('Leads must be a positive number'),

    query('interval')
        .notEmpty()
        .withMessage('Interval is required')
        .isIn(['weekly', 'monthly', 'yearly'])
        .withMessage('Invalid interval'),
];

export const validateExpenses = (): ValidationChain[] => [
    query('expenses')
        .notEmpty()
        .withMessage('Expenses are required')
        .isFloat()
        .withMessage('Expenses must be float'),

    query('interval')
        .optional()
        .isIn(['weekly', 'monthly', 'yearly'])
        .withMessage('Invalid interval'),
];
