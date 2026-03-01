const pool = require('../../config/db');
const Category = require('../entities/Category');

class CategoryRepository {
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
