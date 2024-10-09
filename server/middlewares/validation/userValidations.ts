import { query, body, ValidationChain } from 'express-validator';

export const validateAvailability = (): ValidationChain[] => [
    query('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isAlphanumeric()
        .withMessage('Username must contain only letters and numbers'),

    query('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email is invalid')
        .normalizeEmail(),
];

export const validateCustomerDetails = (): ValidationChain[] => [
    body('details.shippingAddress')
        .trim()
        .notEmpty()
        .withMessage('Shipping address is required'),

    body('details.billingAddress')
        .trim()
        .notEmpty()
        .withMessage('Billing address is required'),
];

export const validateLogIn = (): ValidationChain[] => [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .matches(/^[a-zA-Z0-9._-]+$/)
        .withMessage(
            'Username must contain only letters, numbers, underscores, dots, or hyphens'
        ),

    body('password').trim().notEmpty().withMessage('Password is required'),
];

export const validatePasswords = (): ValidationChain[] => [
    body('oldPassword')
        .trim()
        .notEmpty()
        .withMessage('Old password is required'),
    body('newPassword')
        .trim()
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8, max: 16 })
        .withMessage('New password must be between 8 and 16 characters long')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .withMessage(
            'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
];

export const validateRegistration = (): ValidationChain[] => [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage(
            'First name must contain only letters, spaces, hyphens, or apostrophes'
        )
        .escape(),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 3 })
        .withMessage('Last name must be at least 3 characters long')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage(
            'First name must contain only letters, spaces, hyphens, or apostrophes'
        )
        .escape(),

    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9._-]+$/)
        .withMessage(
            'Username must contain only letters, numbers, underscores, dots, or hyphens'
        ),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email is invalid')
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters long')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
];

export const validateUserUpdateDetails = (): ValidationChain[] => [
    body('profilePictureUrl')
        .trim()
        .notEmpty()
        .withMessage('Profile picture URL is required'),

    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage(
            'First name must contain only letters, spaces, hyphens, or apostrophes'
        )
        .escape(),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 3 })
        .withMessage('Last name must be at least 3 characters long')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage(
            'Last name must contain only letters, spaces, hyphens, or apostrophes'
        )
        .escape(),
];
