import { query, body, param, ValidationChain } from 'express-validator';

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
        .isAlpha()
        .withMessage('Country name must contain only letters'),

    body('rate')
        .trim()
        .notEmpty()
        .withMessage('Shipping rate is required')
        .isFloat()
        .withMessage('Shipping rate must be a floating point number'),
];

export const validateShippingCity = (): ValidationChain[] => [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('City name is required')
        .isAlpha()
        .withMessage('City name must contain only letters'),

    body('postalCode')
        .trim()
        .notEmpty()
        .withMessage('Postal code is required')
        .isInt()
        .withMessage('Postal code must be an integer'),
];

export const validateShippingMethodRate = (): ValidationChain[] => [
    body('method')
        .trim()
        .notEmpty()
        .withMessage('Method is required')
        .isIn(['standard', 'express', 'next-day'])
        .withMessage('Method must be standard, express or next-day'),

    body('rate')
        .trim()
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
        .trim()
        .notEmpty()
        .withMessage('Rate is required')
        .isFloat()
        .withMessage('Rate must be a floating point number'),
];

export const validateCountryId = (): ValidationChain[] => [
    param('countryId')
        .notEmpty()
        .withMessage('Country Id is required')
        .isInt({ min: 1 })
        .withMessage('Country Id must be a positive integer'),
];
