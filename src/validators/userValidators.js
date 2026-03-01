const { body, param, validationResult } = require('express-validator');

const validateUser = [
    body('password')
        .isStrongPassword()
        .withMessage('Must be strong password')
        .notEmpty()
        .withMessage('Password is required'),
    body('email')
        .isEmail()
        .withMessage('Invalid email format')
        .notEmpty()
        .withMessage('Email is required'),
    body('userType')
        .isIn(['student', 'instructor'])
        .withMessage('Invalid user type')
        .notEmpty()
        .withMessage('User type is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserId = [
    param('id').isInt().withMessage('ID must be an integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserEmail = [
    param('email')
        .isEmail()
        .withMessage('Invalid email format')
        .notEmpty()
        .withMessage('Email is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserLogin = [
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    body('email')
        .notEmpty()
        .withMessage('Email is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Password is required'),
    body('newPassword')
        .isStrongPassword()
        .withMessage('Must be strong password')
        .notEmpty()
        .withMessage('New Password is required'),
    body('email')
        .isEmail()
        .withMessage('Invalid email format')
        .notEmpty()
        .withMessage('Email is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateUser,
    validateUserId,
    validateUserEmail,
    validateUserLogin,
    validateUserChangePassword
};
