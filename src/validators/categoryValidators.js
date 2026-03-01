const { body, param, validationResult } = require('express-validator');

const validateCategory = [
    body('categoryName')
        .isString()
        .withMessage('categoryName must be string')
        .notEmpty()
        .withMessage('categoryName is required'),
    body('description')
        .isString()
        .withMessage('description must be string')
        .notEmpty()
        .withMessage('description is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCategoryId = [
    param('id').isInt().withMessage('ID must be integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCategory,
    validateCategoryId,
};
