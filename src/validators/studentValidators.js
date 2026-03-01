const { body, param, validationResult } = require('express-validator');

const validateStudent = [
    body('userId')
        .isInt()
        .withMessage('userId must be integer')
        .notEmpty()
        .withMessage('userId is required'),
    body('stuFName')
        .isString()
        .withMessage('stuFName must be string')
        .notEmpty()
        .withMessage('stuFName is required'),
    body('stuLName')
        .isString()
        .withMessage('stuLName must be string')
        .notEmpty()
        .withMessage('stuLName is required'),
    body('dob')
        .isDate()
        .withMessage('dob must be date')
        .notEmpty()
        .withMessage('dob is required'),
    body('profilePicture')
        .custom(value => {
            return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(value) || /^data:image\/[a-z]+;base64,/.test(value);
        })
        .withMessage('profilePicture must be a valid URL or Base64 string')
        .notEmpty()
        .withMessage('profilePicture is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateStudentId = [
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
    validateStudent,
    validateStudentId,
};
