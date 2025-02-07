import { query, body, ValidationChain } from 'express-validator';

export const validateAvailability = (): ValidationChain[] => [
    query('username')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\d._-]+$/)
        .withMessage(
            'Username must contain only letters, numbers, dots, underscores, or hyphens'
        ),

    query('email')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email is invalid')
        .normalizeEmail(),
];

export const validateCustomerDetails = (): ValidationChain[] => [
    body('details.shippingAddress')
        .optional()
        .trim()
        .matches(
            /^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]+\.\s\d+,\s\d{5}\s[A-Za-zÀ-ÖØ-öø-ÿ'’\-\s]+,\s[A-Z\s]+$/
        )
        .withMessage(
            'Shipping address must contain only letters, numbers, dots, commas, or hyphens'
        ),

    body('details.billingAddress')
        .optional()
        .trim()
        .matches(
            /^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]+\.\s\d+,\s\d{5}\s[A-Za-zÀ-ÖØ-öø-ÿ'’\-\s]+,\s[A-Z\s]+$/
        )
        .withMessage(
            'Billing address must contain only letters, numbers, dots, commas, or hyphens'
        ),
];

export const validateLogIn = (): ValidationChain[] => [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\d._-]+$/)
        .withMessage(
            'Username must contain only letters, numbers, dots, underscores, or hyphens'
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
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage(
            'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
];

export const validateRegistration = (): ValidationChain[] => [
    body('details.firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'’]+$/)
        .withMessage(
            'First name must contain only letters, spaces, or apostrophes'
        )
        .toLowerCase(),

    body('details.lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 3 })
        .withMessage('Last name must be at least 3 characters long')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'’]+$/)
        .withMessage(
            'First name must contain only letters, spaces, or apostrophes'
        )
        .toLowerCase(),

    body('details.username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\d._-]+$/)
        .withMessage(
            'Username must contain only letters, numbers, dots, underscores, or hyphens'
        ),

    body('details.email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email is invalid')
        .normalizeEmail(),

    body('details.role')
        .optional()
        .trim()
        .isIn(['admin', 'manager'])
        .withMessage('Role must be either "admin" or "manager"'),

    body('details.password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters long')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
];

export const validateUserUpdateDetails = (): ValidationChain[] => [
    body('details.profilePictureUrl').optional().trim(),

    body('details.firstName')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'’]+$/)
        .withMessage(
            'First name must contain only letters, spaces, or apostrophes'
        ),

    body('details.lastName')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Last name must be at least 3 characters long')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'’]+$/)
        .withMessage(
            'Last name must contain only letters, spaces, or apostrophes'
        ),
];
