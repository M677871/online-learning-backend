const { body, param, validationResult } = require('express-validator');

const allowedMaterialTypes = ['video', 'document', 'link', 'pdf'];

const validateMaterial = [
    body('courseId')
        .isInt()
        .withMessage('courseId must be an integer')
        .notEmpty()
        .withMessage('courseId is required'),
    body('title')
        .isString()
        .withMessage('title must be a string')
        .notEmpty()
        .withMessage('title is required'),
    body('materialType')
        .isString()
        .withMessage('materialType must be a string')
        .notEmpty()
        .withMessage('materialType is required')
        .isIn(allowedMaterialTypes)
        .withMessage(`materialType must be one of the following: ${allowedMaterialTypes.join(', ')}`),
    body('filePath')
        .custom(value => {
            return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(value) || /^data:image\/[a-z]+;base64,/.test(value);
        })
        .withMessage('filePath must be a valid URL or Base64 string')
        .notEmpty()
        .withMessage('filePath is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateMaterialId = [
    param('id')
        .isInt()
        .withMessage('ID must be an integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateMaterial,
    validateMaterialId,
};
