import { query, ValidationChain } from 'express-validator';

export const validatePurchaseFilter = (): ValidationChain[] => [
    query('filter')
        .trim()
        .notEmpty()
        .withMessage('Filter field is required')
        .isIn(['quantity', 'totalRevenue'])
        .withMessage('Field must be quantity or totalRevenue'),
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
