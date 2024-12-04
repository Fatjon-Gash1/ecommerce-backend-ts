import { param, query, ValidationChain } from 'express-validator';

export const validateId = (value: string = 'id'): ValidationChain[] => [
    param(value)
        .notEmpty()
        .withMessage(
            `${value.charAt(0).toUpperCase() + value.slice(1)} is required`
        )
        .isInt({ min: 1 })
        .withMessage(
            `${value.charAt(0).toUpperCase() + value.slice(1)} must be a positive integer`
        ),
];

export const validateObjectId = (value: string = 'id'): ValidationChain[] => [
    param(value)
        .notEmpty()
        .withMessage('Id is required')
        .isMongoId()
        .withMessage(
            (_, { req }) => `${req.params!.id} must be a valid MongoDB ObjectId`
        ),
];

export const validateQuery = (value: string = 'q'): ValidationChain[] => [
    query(value)
        .trim()
        .notEmpty()
        .withMessage(
            `${value.charAt(0).toUpperCase() + value.slice(1)} is required`
        )
        .isLength({ max: 32 })
        .withMessage(
            `${value.charAt(0).toUpperCase() + value.slice(1)} must be 32 characters or less`
        ),
];
