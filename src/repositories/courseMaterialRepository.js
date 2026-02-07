const { query } = require('../db/pool');

class CourseMaterialRepository {
  static async createCourseMaterial({ courseId, title, materialType, filePath }) {
    const sql = 'INSERT INTO course_materials (course_id, title, material_type, file_path, created_at) VALUES (?, ?, ?, ?, NOW())';
    const result = await query(sql, [courseId, title, materialType, filePath]);
    return Number(result.insertId);
  }

  static async getCourseMaterialById(materialId) {
    const sql = 'SELECT * FROM course_materials WHERE material_id = ?';
    const rows = await query(sql, [materialId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllCourseMaterials() {
    const sql = 'SELECT * FROM course_materials';
    return query(sql);
  }

  static async updateCourseMaterial(materialId, { courseId, title, materialType, filePath }) {
    const sql = 'UPDATE course_materials SET course_id=?, title=?, material_type=?, file_path=? WHERE material_id=?';
    const result = await query(sql, [courseId, title, materialType, filePath, materialId]);
    return result.affectedRows;
  }

  static async deleteCourseMaterial(materialId) {
    const sql = 'DELETE FROM course_materials WHERE material_id = ?';
    const result = await query(sql, [materialId]);
    return result.affectedRows;
  }

  static async materialExists(materialId) {
    const sql = 'SELECT 1 FROM course_materials WHERE material_id = ? LIMIT 1';
    const rows = await query(sql, [materialId]);
    return rows.length > 0;
  }

  static async getMaterialsByCourseId(courseId) {
    const sql = 'SELECT * FROM course_materials WHERE course_id = ?';
    return query(sql, [courseId]);
  }
}

module.exports = CourseMaterialRepository;
