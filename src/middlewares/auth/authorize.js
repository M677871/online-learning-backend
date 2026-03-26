const ApiError = require('../ApiError');

/**
 * Access control middleware to permit specific user roles.
 * Must be used after the `authenticate` middleware.
 * 
 * @param {string[]} [allowedRoles=[]] - An array of user types that are permitted to access the route.
 * @returns {import('express').RequestHandler} Express middleware function checking user roles.
 */
const authorize = (allowedRoles = []) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.userType)) {
            throw ApiError.forbidden(
                `Access denied. Required role(s): ${allowedRoles.join(', ')}`
            );
        }

        next();
    };
};

module.exports = authorize;
