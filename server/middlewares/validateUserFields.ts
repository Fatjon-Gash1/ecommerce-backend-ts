import { body, ValidationChain } from 'express-validator';

const validateUserFields: ValidationChain[] = [
    body('firstName')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('First name is required'),
    body('lastName')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Last name is required'),
    body('username')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Username is required'),
    body('email')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 12 })
        .withMessage('Password must be between 8 and 12 characters long'),
];

// Another function for update field validation goes here

export default validateUserFields;
