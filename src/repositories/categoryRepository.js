const { query } = require('../db/pool');

class CategoryRepository {
  static async createCategory({ categoryName, description }) {
    const sql = 'INSERT INTO categories (category_name, description) VALUES (?, ?)';
    const result = await query(sql, [categoryName, description]);
    return Number(result.insertId);
  }

  static async getCategoryById(categoryId) {
    const sql = 'SELECT * FROM categories WHERE category_id = ?';
    const rows = await query(sql, [categoryId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllCategories() {
    const sql = 'SELECT * FROM categories';
    return query(sql);
  }

  static async updateCategory(categoryId, { categoryName, description }) {
    const sql = 'UPDATE categories SET category_name=?, description=? WHERE category_id=?';
    const result = await query(sql, [categoryName, description, categoryId]);
    return result.affectedRows;
  }

  static async deleteCategory(categoryId) {
    const sql = 'DELETE FROM categories WHERE category_id = ?';
    const result = await query(sql, [categoryId]);
    return result.affectedRows;
  }

  static async categoryExists(categoryId) {
    const sql = 'SELECT 1 FROM categories WHERE category_id = ? LIMIT 1';
    const rows = await query(sql, [categoryId]);
    return rows.length > 0;
  }

  static async getCategoryCourses(categoryId) {
    const sql = 'SELECT * FROM courses WHERE categorie_id = ?';
    return query(sql, [categoryId]);
  }

  static async getCategoryInstructors(categoryId) {
    const sql = `SELECT DISTINCT i.* FROM instructors i
                 JOIN courses c ON c.instructor_id = i.instructor_id
                 WHERE c.categorie_id = ?`;
    return query(sql, [categoryId]);
  }
}

module.exports = CategoryRepository;
