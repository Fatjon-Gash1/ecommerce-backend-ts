import { body, param, ValidationChain } from 'express-validator';

export const validateShippingCostDetails = (): ValidationChain[] => [
    body('countryName')
        .trim()
        .notEmpty()
        .withMessage('Country name is required')
        .isAlpha()
        .withMessage('Country name must contain only letters'),

    body('shippingMethod')
        .trim()
        .notEmpty()
        .withMessage('Shipping method is required')
        .isAlpha()
        .withMessage('Shipping method must contain only letters'),
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

export const validateShippingRate = (): ValidationChain[] => [
    body('type')
        .trim()
        .notEmpty()
        .withMessage('Type is required')
        .isAlpha()
        .withMessage('Type must contain only letters'),

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
