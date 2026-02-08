/**
 * Serializes a domain category object for API responses.
 *
 * @param {object} category - Domain category object (from categoryMapper)
 * @returns {object} API response object
 */
const serialize = (category) => {
  if (!category) return null;
  return {
    categoryId: category.categoryId,
    categoryName: category.categoryName,
    description: category.description,
  };
}

/**
 * Serializes an array of domain category objects.
 * @param {object[]} categories
 * @returns {object[]}
 */
const serializeList = (categories) => {
  return (categories || []).map(serialize);
}

module.exports = { serialize, serializeList };
