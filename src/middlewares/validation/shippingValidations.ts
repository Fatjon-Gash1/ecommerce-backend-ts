import { query, body, ValidationChain } from 'express-validator';

export const validateShippingCostDetails = (): ValidationChain[] => [
    query('country')
        .trim()
        .notEmpty()
        .withMessage('Country name is required')
        .isAlpha()
        .withMessage('Country name must contain only letters'),

    query('shipping-method')
        .trim()
        .notEmpty()
        .withMessage('Shipping method is required')
        .isIn(['standard', 'express', 'next-day'])
        .withMessage('Shipping method must be standard, express or next-day'),
];

export const validateShippingCountry = (): ValidationChain[] => [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Country name is required')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]+$/)
        .withMessage(
            'Country name must contain only letters, numbers, dots, commas, or hyphens'
        ),

    body('rate')
        .notEmpty()
        .withMessage('Shipping rate is required')
        .isFloat({ min: 0.5, max: 100 })
        .withMessage(
            'Shipping rate must be a floating point number between 0.5 and 100'
        ),
];

export const validateShippingCountryUpdate = (): ValidationChain[] => [
    body('name')
        .optional()
        .trim()
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]+$/)
        .withMessage(
            'Country name must contain only letters, numbers, dots, commas, or hyphens'
        ),

    body('rate')
        .optional()
        .isFloat({ min: 0.5, max: 100 })
        .withMessage(
            'Shipping rate must be a floating point number between 0.5 and 100'
        ),
];

export const validateShippingCity = (): ValidationChain[] => [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('City name is required')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]+$/)
        .withMessage(
            'City name must contain only letters, numbers, dots, commas, or hyphens'
        ),

    body('postalCode')
        .notEmpty()
        .withMessage('Postal code is required')
        .isAlphanumeric()
        .withMessage('Postal code must be a number, string, or alphanumeric'),
];

export const validateShippingCityUpdate = (): ValidationChain[] => [
    body('name')
        .optional()
        .trim()
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]+$/)
        .withMessage(
            'City name must contain only letters, numbers, dots, commas, or hyphens'
        ),

    body('postalCode')
        .optional()
        .isAlphanumeric()
        .withMessage('Postal code must be a number, string, or alphanumeric'),
];

export const validateShippingMethodRate = (): ValidationChain[] => [
    body('method')
        .trim()
        .notEmpty()
        .withMessage('Method is required')
        .isIn(['standard', 'express', 'next-day'])
        .withMessage('Method must be standard, express or next-day'),

    body('rate')
        .notEmpty()
        .withMessage('Rate is required')
        .isFloat()
        .withMessage('Rate must be a floating point number'),
];

export const validateShippingWeightRate = (): ValidationChain[] => [
    body('weight')
        .trim()
        .notEmpty()
        .withMessage('Weight is required')
        .isIn(['light', 'standard', 'heavy'])
        .withMessage('Weight must be light, standard or heavy'),

    body('rate')
        .notEmpty()
        .withMessage('Rate is required')
        .isFloat()
        .withMessage('Rate must be a floating point number'),
];
