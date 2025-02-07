import { body, query, ValidationChain } from 'express-validator';

export const validateCategory = (): ValidationChain[] => [
    body('name').trim().notEmpty().withMessage('Category name is required'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),

    body('parentId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Parent ID must be a positive number'),
];

export const validateProduct = (): ValidationChain[] => [
    body('details.name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .matches(/^[A-Za-z\s\d.,'()&]*$/)
        .withMessage('Product name must contain only valid characters'),

    body('details.description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .matches(/^[A-Za-z\s\d.,!?:"'()&%-]*$/)
        .withMessage('Description must contain only valid characters'),

    body('details.price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0.25 })
        .withMessage('Price must be no less than 0.25 cents'),

    body('details.discount')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Discount must be a number between 0 and 100'),

    body('details.imageUrl')
        .trim()
        .notEmpty()
        .withMessage('Image URL is required'),

    body('details.stockQuantity')
        .optional()
        .isInt({ min: 1, max: 99 })
        .withMessage(
            'Stock quantity must be a positive number and no more than 99'
        ),

    body('details.weight')
        .isFloat({ min: 0.1, max: 99.9 })
        .withMessage(
            'Weight must be a positive number and no more than 99.9kg'
        ),
];

export const validateStockStatus = (): ValidationChain[] => [
    query('status')
        .trim()
        .toLowerCase()
        .isIn(['in stock', 'out of stock'])
        .withMessage('Invalid stock status'),
];

export const validateDiscount = (): ValidationChain[] => [
    body('discount')
        .isInt({ min: 0, max: 100 })
        .withMessage('Discount must be a number between 0 and 100'),
];

export const validateCategoryUpdate = (): ValidationChain[] => [
    body('name')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s.,'()&]*$/)
        .withMessage('Description must contain only valid characters'),

    body('description')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s\d.,!?:"'()&%]*$/)
        .withMessage('Description must contain only valid characters'),
];

export const validateProductUpdate = (): ValidationChain[] => [
    body('details.name')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s\d.,'()&]*$/)
        .withMessage('Product name must contain only valid characters'),

    body('details.description')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s\d.,!?:"'()&%]*$/)
        .withMessage('Description must contain only valid characters'),

    body('details.price')
        .optional()
        .isFloat({ min: 0.25 })
        .withMessage('Price must be no less than 0.25 cents'),

    body('details.discount')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Discount must be a number between 0 and 100'),

    body('details.imageUrl').optional().trim(),

    body('details.stockQuantity')
        .optional()
        .isInt({ min: 1, max: 99 })
        .withMessage(
            'Stock quantity must be a positive number and no more than 99'
        ),

    body('details.weight')
        .optional()
        .isFloat({ min: 0.1, max: 99.9 })
        .withMessage(
            'Weight must be a positive number and no more than 99.9kg'
        ),
];
