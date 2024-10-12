import { body, ValidationChain } from 'express-validator';

const commonRatingCreationValidatoins = [
    body('details.firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isAlpha()
        .withMessage('First name must contain only letters'),

    body('details.lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isAlpha()
        .withMessage('Last name must contain only letters'),

    body('details.userProfession')
        .optional()
        .trim()
        .isAlpha()
        .withMessage('User profession must contain only letters'),

    body('details.rating')
        .trim()
        .notEmpty()
        .withMessage('Rating is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must contain only numbers between 1 and 5'),

    body('details.review')
        .trim()
        .notEmpty()
        .withMessage('Review is required')
        .isAlpha()
        .withMessage('Review must contain only letters'),

    body('details.anonymous')
        .optional()
        .isBoolean()
        .withMessage('Field must be a boolean'),
];

const commonRatingUpdateValidations = [
    body('details.firstName')
        .optional()
        .trim()
        .isAlpha()
        .withMessage('First name must contain only letters'),

    body('details.lastName')
        .optional()
        .trim()
        .isAlpha()
        .withMessage('Last name must contain only letters'),

    body('details.userProfession')
        .optional()
        .trim()
        .isAlpha()
        .withMessage('User profession must contain only letters'),

    body('details.rating')
        .optional()
        .trim()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must contain only numbers between 1 and 5'),

    body('details.review')
        .optional()
        .trim()
        .isAlpha()
        .withMessage('Review must contain only letters'),

    body('details.anonymous')
        .optional()
        .isBoolean()
        .withMessage('Field must be a boolean'),
];

export const validatePlatformRating = (): ValidationChain[] => [
    body('details.userId')
        .trim()
        .notEmpty()
        .withMessage('User ID is required')
        .isInt()
        .withMessage('User ID must be a number'),

    ...commonRatingCreationValidatoins,
    body('details.featureHighlights')
        .optional()
        .isAlpha()
        .withMessage('Field must contain only letters'),
];

export const validateProductRating = (): ValidationChain[] => [
    body('details.userId')
        .trim()
        .notEmpty()
        .withMessage('User ID is required')
        .isInt()
        .withMessage('User ID must be a number'),

    body('details.productId')
        .trim()
        .notEmpty()
        .withMessage('Product ID is required')
        .isInt()
        .withMessage('Product ID must be a number'),

    ...commonRatingCreationValidatoins,

    body('details.productHighlights')
        .optional()
        .trim()
        .isAlpha()
        .withMessage('Field must contain only letters'),

    body('details.alternatives')
        .optional()
        .isArray()
        .withMessage('Field must be an array'),
];

export const validatePlatformRatingUpdate = (): ValidationChain[] => [
    ...commonRatingUpdateValidations,
    body('details.featureHighlights')
        .optional()
        .isAlpha()
        .withMessage('Field must contain only letters'),
];

export const validateProductRatingUpdate = (): ValidationChain[] => [
    ...commonRatingUpdateValidations,
    body('details.productHighlights')
        .optional()
        .trim()
        .isAlpha()
        .withMessage('Field must contain only letters'),

    body('details.alternatives')
        .optional()
        .isArray()
        .withMessage('Field must be an array'),
];
