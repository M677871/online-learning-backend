const pool = require('../../config/db');
const CourseMaterial = require('../entities/CourseMaterial');

class CourseMaterialRepository {
    static async createCourseMaterial({ courseId, title, materialType, filePath }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO course_materials (course_id, title, material_type, file_path, created_at) VALUES (?, ?, ?, ?, NOW())';
            const result = await conn.query(sql, [courseId, title, materialType, filePath]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getCourseMaterialById(materialId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM course_materials WHERE material_id = ?';
            const rows = await conn.query(sql, [materialId]);
            return rows.length ? CourseMaterial.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllCourseMaterials() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM course_materials';
            const rows = await conn.query(sql);
            return rows.map(row => CourseMaterial.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateCourseMaterial(materialId, { courseId, title, materialType, filePath }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE course_materials SET course_id=?, title=?, material_type=?, file_path=? WHERE material_id=?';
            const result = await conn.query(sql, [courseId, title, materialType, filePath, materialId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteCourseMaterial(materialId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM course_materials WHERE material_id = ?';
            const result = await conn.query(sql, [materialId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async materialExists(materialId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM course_materials WHERE material_id = ? LIMIT 1';
            const rows = await conn.query(sql, [materialId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getMaterialsByCourseId(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM course_materials WHERE course_id = ?';
            const rows = await conn.query(sql, [courseId]);
            return rows.map(row => CourseMaterial.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = CourseMaterialRepository;
