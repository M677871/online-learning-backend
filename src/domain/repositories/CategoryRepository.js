const pool = require('../../config/db');
const Category = require('../entities/Category');

/**
 * Data access layer for Category entities.
 */
class CategoryRepository {
    /**
     * Inserts a new category into the database.
     * @param {Object} params
     * @param {string} params.categoryName - Name of the category.
     * @param {string} params.description - Category description.
     * @returns {Promise<number>} The ID of the newly created category.
     */
    static async createCategory({ categoryName, description }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO categories (category_name, description) VALUES (?, ?)';
            const result = await conn.query(sql, [categoryName, description]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves a category by its ID.
     * @param {number|string} categoryId - The ID of the category.
     * @returns {Promise<Category|null>} A Category entity or null if not found.
     */
    static async getCategoryById(categoryId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM categories WHERE category_id = ?';
            const rows = await conn.query(sql, [categoryId]);
            return rows.length ? Category.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves all categories.
     * @returns {Promise<Category[]>} Array of Category entities.
     */
    static async getAllCategories() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM categories';
            const rows = await conn.query(sql);
            return rows.map(row => Category.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Updates an existing category's details.
     * @param {number|string} categoryId - The category ID to update.
     * @param {Object} params
     * @param {string} params.categoryName - New category name.
     * @param {string} params.description - New category description.
     * @returns {Promise<number>} The number of affected rows.
     */
    static async updateCategory(categoryId, { categoryName, description }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE categories SET category_name=?, description=? WHERE category_id=?';
            const result = await conn.query(sql, [categoryName, description, categoryId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Deletes a category.
     * @param {number|string} categoryId - The ID of the category to delete.
     * @returns {Promise<number>} The number of affected rows.
     */
    static async deleteCategory(categoryId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM categories WHERE category_id = ?';
            const result = await conn.query(sql, [categoryId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Checks if a category exists by its ID.
     * @param {number|string} categoryId - The category ID.
     * @returns {Promise<boolean>} True if the category exists.
     */
    static async categoryExists(categoryId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM categories WHERE category_id = ? LIMIT 1';
            const rows = await conn.query(sql, [categoryId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves all courses assigned to a specific category.
     * @param {number|string} categoryId - The category ID.
     * @returns {Promise<Object[]>} Array of course records.
     */
    static async getCategoryCourses(categoryId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM courses WHERE categorie_id = ?';
            const rows = await conn.query(sql, [categoryId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves all distinct instructors who have courses in this category.
     * @param {number|string} categoryId - The category ID.
     * @returns {Promise<Object[]>} Array of instructor records.
     */
    static async getCategoryInstructors(categoryId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `SELECT DISTINCT i.* FROM instructors i
                         JOIN courses c ON c.instructor_id = i.instructor_id
                         WHERE c.categorie_id = ?`;
            const rows = await conn.query(sql, [categoryId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = CategoryRepository;
