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

export const validateReportName = (): ValidationChain[] => [
    query('name')
        .trim()
        .notEmpty()
        .withMessage('Report name is required')
        .isAlpha()
        .withMessage('Report name must contain only letters'),
];

export const validateReportType = (): ValidationChain[] => [
    query('type')
        .trim()
        .notEmpty()
        .withMessage('Report type is required')
        .isIn(['sales', 'stock'])
        .withMessage('Invalid report type'),
];
