import { body, query, ValidationChain } from 'express-validator';

export const validateType = (): ValidationChain[] => [
    query('type')
        .optional()
        .isIn(['one-on-one', 'group', 'support'])
        .withMessage(
            'Chatroom type must be one of: one-on-one, group, or support'
        ),
];

export const validateMessageDate = (): ValidationChain[] => [
    query('last-message-date')
        .optional()
        .isDate()
        .withMessage('Last message date must be a valid date'),
];

export const validateRating = (): ValidationChain[] => [
    body('rating')
        .notEmpty()
        .withMessage('Rating is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
];
