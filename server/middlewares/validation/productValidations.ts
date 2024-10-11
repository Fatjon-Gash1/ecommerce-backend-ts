import { body, ValidationChain } from 'express-validator';

export const validateCategory = (): ValidationChain[] => [
    body('name').trim().notEmpty().withMessage('Category name is required'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
];

export const validateSubCategory = (): ValidationChain[] => [
    body('name').trim().notEmpty().withMessage('SubCategory name is required'),
];

export const validateCategoryWithSubCategories = (): ValidationChain[] => [
    body('name').trim().notEmpty().withMessage('Category name is required'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),

    body('subNames')
        .trim()
        .notEmpty()
        .withMessage('Category subcategories are required'),
];

export const validateProduct = (): ValidationChain[] => [
    body('details.name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required'),

    body('details.description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),

    body('details.price')
        .trim()
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('details.discount')
        .optional()
        .trim()
        .isInt({ min: 0, max: 100 })
        .withMessage('Discount must be a number between 0 and 100'),

    body('details.imageUrl')
        .trim()
        .notEmpty()
        .withMessage('Image URL is required'),

    body('details.stockQuantity')
        .optional()
        .trim()
        .isInt({ min: 0, max: 5 })
        .withMessage('Stock quantity must be a positive number'),

    body('details.weight')
        .optional()
        .trim()
        .isFloat({ min: 0.1 })
        .withMessage('Weight must be a positive number'),
];

export const validateDiscount = (): ValidationChain[] => [
    body('discount')
        .trim()
        .isInt({ min: 0, max: 100 })
        .withMessage('Discount must be a number between 0 and 100'),
];

export const validateProductUpdate = (): ValidationChain[] => [
    body('details.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Product name is required'),

    body('details.description')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Description is required'),

    body('details.price')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('details.discount')
        .optional()
        .trim()
        .isInt({ min: 0, max: 100 })
        .withMessage('Discount must be a number between 0 and 100'),

    body('details.imageUrl')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Image URL is required'),

    body('details.stockQuantity')
        .optional()
        .trim()
        .isInt({ min: 0, max: 5 })
        .withMessage('Stock quantity must be a positive number'),

    body('details.weight')
        .optional()
        .trim()
        .isFloat({ min: 0.1 })
        .withMessage('Weight must be a positive number'),
];
