const pool = require('../../config/db');
const CourseMaterial = require('../entities/CourseMaterial');

const pool = require('../../config/db');
const CourseMaterial = require('../entities/CourseMaterial');

/**
 * Repository class handling database operations for course materials.
 */
class CourseMaterialRepository {
    /**
     * Inserts a new course material record into the database.
     * @param {Object} data - Course material details.
     * @param {number|string} data.courseId - Associated course ID.
     * @param {string} data.title - Title of the material.
     * @param {string} data.materialType - Type (e.g. video, document).
     * @param {string} data.filePath - Path or URL to the resource.
     * @returns {Promise<number>} The newly created material ID.
     */
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

    /**
     * Retrieves a course material by its ID.
     * @param {number|string} materialId - The material ID to fetch.
     * @returns {Promise<CourseMaterial|null>} A CourseMaterial instance or null if not found.
     */
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

    /**
     * Retrieves all course materials from the database.
     * @returns {Promise<Array<CourseMaterial>>} A list of all course materials.
     */
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

    /**
     * Updates an existing course material record.
     * @param {number|string} materialId - The ID of the material to update.
     * @param {Object} data - Updated details.
     * @param {number|string} data.courseId - Associated course ID.
     * @param {string} data.title - New title.
     * @param {string} data.materialType - New assigned type.
     * @param {string} data.filePath - New file path or URL.
     * @returns {Promise<number>} Number of affected rows.
     */
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

    /**
     * Deletes a course material record by its ID.
     * @param {number|string} materialId - The ID of the material to delete.
     * @returns {Promise<number>} Number of affected rows.
     */
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

    /**
     * Checks if a course material exists by ID.
     * @param {number|string} materialId - The material ID to check.
     * @returns {Promise<boolean>} True if the record exists, otherwise false.
     */
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

    /**
     * Retrieves all course materials associated with a particular course.
     * @param {number|string} courseId - The course ID.
     * @returns {Promise<Array<CourseMaterial>>} A list of CourseMaterial instances.
     */
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
