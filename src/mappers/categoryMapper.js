/**
 * Maps a raw DB row from the `categories` table to a domain object.
 *
 * @param {object} row - Raw database row
 * @returns {object} Domain category object
 */
const toDomain = (row) => {
  if (!row) return null;
  return {
    categoryId: row.category_id,
    categoryName: row.category_name,
    description: row.description,
  };
}

/**
 * Maps an array of raw DB rows to domain objects.
 * @param {object[]} rows
 * @returns {object[]}
 */
const toDomainList = (rows) =>   {
  return (rows || []).map(toDomain);
}

module.exports = { toDomain, toDomainList };
