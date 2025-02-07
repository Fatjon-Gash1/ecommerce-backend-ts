import { body, ValidationChain } from 'express-validator';

const commonRatingCreationValidations = [
    body('details.firstName')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('First name must contain only letters and spaces'),

    body('details.lastName')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('Last name must contain only letters and spaces'),

    body('details.userProfession')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('User profession must contain only letters and spaces'),

    body('details.rating')
        .notEmpty()
        .withMessage('Rating is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must contain only numbers between 1 and 5'),

    body('details.review')
        .trim()
        .notEmpty()
        .withMessage('Review is required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Review must be between 10 and 500 characters.')
        .matches(/^[A-Za-z\d\s.,!?:"'()&%$#@_]*$/)
        .withMessage(
            'Review must contain only letters, numbers, spaces and commonly used characters'
        ),

    body('details.anonymous')
        .optional()
        .isBoolean()
        .withMessage('Field must be a boolean'),
];

const commonRatingUpdateValidations = [
    body('details.firstName')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('First name must contain only letters and spaces'),

    body('details.lastName')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('Last name must contain only letters and spaces'),

    body('details.userProfession')
        .optional()
        .trim()
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('User profession must contain only letters and spaces'),

    body('details.rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must contain only numbers between 1 and 5'),

    body('details.review')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Review must be between 10 and 500 characters.')
        .matches(/^[A-Za-z\d\s.,!?:"'()&%$#@_]*$/)
        .withMessage(
            'Review must contain only letters, numbers, spaces and commonly used characters'
        ),

    body('details.anonymous')
        .optional()
        .isBoolean()
        .withMessage('Field must be a boolean'),
];

export const validatePlatformRating = (): ValidationChain[] => [
    ...commonRatingCreationValidations,
    body('details.featureHighlights')
        .optional()
        .isLength({ min: 10, max: 500 })
        .withMessage(
            'Feature highlights must be between 10 and 500 characters.'
        )
        .matches(/^[A-Za-z\d\s.,!?:"'()&%$#@_]*$/)
        .withMessage(
            'Feature highlights must contain only letters, numbers, spaces and commonly used characters'
        ),
];

export const validateProductRating = (): ValidationChain[] => [
    ...commonRatingCreationValidations,

    body('details.productHighlights')
        .optional()
        .trim()
        .matches(/^[A-Za-z\d\s.,!?:"'()&%$#@_]*$/)
        .withMessage(
            'Product highlights must contain only letters, numbers, spaces and commonly used characters'
        ),

    body('details.alternatives')
        .optional()
        .isArray()
        .withMessage('Field must be an array'),
];

export const validatePlatformRatingUpdate = (): ValidationChain[] => [
    ...commonRatingUpdateValidations,
    body('details.featureHighlights')
        .optional()
        .isLength({ min: 10, max: 500 })
        .withMessage(
            'Feature highlights must be between 10 and 500 characters.'
        )
        .matches(/^[A-Za-z\d\s.,!?:"'()&%$#@_]*$/)
        .withMessage(
            'Feature highlights must contain only letters, numbers, spaces and commonly used characters'
        ),
];

export const validateProductRatingUpdate = (): ValidationChain[] => [
    ...commonRatingUpdateValidations,
    body('details.productHighlights')
        .optional()
        .trim()
        .matches(/^[A-Za-z\d\s.,!?:"'()&%$#@_]*$/)
        .withMessage(
            'Product highlights must contain only letters, numbers, spaces and commonly used characters'
        ),

    body('details.alternatives')
        .optional()
        .isArray()
        .withMessage('Field must be an array'),
];
