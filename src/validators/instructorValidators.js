const { body, param, validationResult } = require('express-validator');

const validateInstructor = [
    body('userId')
        .isInt()
        .withMessage('userId must be integer')
        .notEmpty()
        .withMessage('userId is required'),
    body('insFName')
        .isString()
        .withMessage('insFName must be string')
        .notEmpty()
        .withMessage('insFName is required'),
    body('insLName')
        .isString()
        .withMessage('insLName must be string')
        .notEmpty()
        .withMessage('insLName is required'),
    body('bio')
        .isString()
        .withMessage('bio must be string')
        .notEmpty()
        .withMessage('bio is required'),
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

const validateInstructorId = [
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
    validateInstructor,
    validateInstructorId,
};
