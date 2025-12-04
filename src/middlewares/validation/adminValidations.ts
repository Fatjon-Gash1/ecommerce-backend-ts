import { query, body, ValidationChain } from 'express-validator';

export const validateAdminRole = (): ValidationChain[] => [
    query('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'manager'])
        .withMessage('Invalid role'),
];

export const validateAdminRoleSet = (): ValidationChain[] => [
    body('role')
        .notEmpty()
        .withMessage('Role number is required')
        .isInt()
        .withMessage('Role must be a valid integer')
        .isIn([1, 2])
        .withMessage('Invalid role number'),
];

export const validateAttribute = (): ValidationChain[] => [
    query('attribute')
        .trim()
        .notEmpty()
        .withMessage('Attribute is required')
        .isIn(['firstName', 'lastName', 'username', 'email'])
        .withMessage('Attribute must be a valid user attribute')
        .isLength({ max: 16 })
        .withMessage('Attribute must be no longer than 16 characters'),

    query('value')
        .trim()
        .notEmpty()
        .withMessage('Value is required')
        .isLength({ max: 320 })
        .withMessage('Attribute must be no longer than 320 characters'),
];

export const validatePlatformData = (): ValidationChain[] => [
    body('companyName')
        .optional()
        .trim()
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\d\s.-]+$/)
        .withMessage(
            'Company name must contain only letters, numbers, dots, or hyphens'
        ),
    body('headquartersAddress')
        .optional()
        .trim()
        .matches(
            /^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]+\.\s\d+,\s\d{5}\s[A-Za-zÀ-ÖØ-öø-ÿ'’\-\s]+,\s[A-Z\s]+$/
        )
        .withMessage(
            'Shipping address must contain only letters, numbers, dots, commas, or hyphens'
        ),

    body('customerSupportEmail')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('customerSupportPhoneNumber')
        .optional()
        .trim()
        .matches(/^(\+?\d{1,4}[-. ]?\(?\d{1,3}\)?[-. ]?\d{1,4}[-. ]?\d{3,6})$/)
        .withMessage('Invalid phone number format'),

    body('operatingHours')
        .optional()
        .trim()
        .matches(
            /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM) - (0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/
        ),

    body('faq')
        .optional()
        .isObject()
        .withMessage('FAQ must be an object')
        .bail(),

    body('faq.question')
        .optional()
        .trim()
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\d\s.,'":?!()&_-]+$/)
        .withMessage('Question must contain only valid characters'),

    body('faq.answer')
        .optional()
        .trim()
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\d\s.,'":?!()&_-]+$/)
        .withMessage('Answer must contain only valid characters'),
];
