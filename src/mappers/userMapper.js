/**
 * Maps a raw DB row from the `users` table to a domain object.
 * This is the internal representation used by services.
 *
 * @param {object} row - Raw database row
 * @returns {object} Domain user object
 */
const toDomain = (row) => {
  if (!row) return null;
  return {
    userId: row.user_id,
    email: row.email,
    passwordHash: row.password_hash,
    userType: row.user_type,
    createdAt: row.create_at,
  };
}

/**
 * Maps an array of raw DB rows to domain objects.
 * @param {object[]} rows
 * @returns {object[]}
 */
const toDomainList = (rows) => {
  return (rows || []).map(toDomain);
}

module.exports = { toDomain, toDomainList };
