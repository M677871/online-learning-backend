const ApiError = require('../ApiError');

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
