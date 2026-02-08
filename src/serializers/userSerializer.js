/**
 * Serializes a domain user object for API responses.
 * NEVER includes passwordHash.
 *
 * @param {object} user - Domain user object (from userMapper)
 * @returns {object} Safe API response object
 */
const serialize = (user) => {
  if (!user) return null;
  return {
    userId: user.userId,
    email: user.email,
    userType: user.userType,
    createdAt: user.createdAt,
  };
}

/**
 * Serializes an array of domain user objects.
 * @param {object[]} users
 * @returns {object[]}
 */
const serializeList = (users) => {
  return (users || []).map(serialize);
}

/**
 * Serializes a login response (token + safe user).
 * @param {string} token
 * @param {object} user - Domain user object
 * @returns {object}
 */
const serializeAuth = (token, user) => {
  return {
    token,
    user: serialize(user),
  };
}

module.exports = { serialize, serializeList, serializeAuth };
