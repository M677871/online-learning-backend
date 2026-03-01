const pool = require('../../config/db');
const Enrollment = require('../entities/Enrollment');

class EnrollmentRepository {
    static async createEnrollment({ studentId, courseId, status }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO enrollments (student_id, course_id, status, enrolled_at) VALUES (?, ?, ?, NOW())';
            const result = await conn.query(sql, [studentId, courseId, status]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getEnrollmentById(enrollmentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM enrollments WHERE enrollment_id = ?';
            const rows = await conn.query(sql, [enrollmentId]);
            return rows.length ? Enrollment.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllEnrollments() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM enrollments';
            const rows = await conn.query(sql);
            return rows.map(row => Enrollment.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateEnrollment(enrollmentId, { studentId, courseId, status }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE enrollments SET student_id=?, course_id=?, status=? WHERE enrollment_id=?';
            const result = await conn.query(sql, [studentId, courseId, status, enrollmentId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteEnrollment(enrollmentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM enrollments WHERE enrollment_id = ?';
            const result = await conn.query(sql, [enrollmentId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async enrollmentExists(enrollmentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM enrollments WHERE enrollment_id = ? LIMIT 1';
            const rows = await conn.query(sql, [enrollmentId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async enrollmentExistsByStudentAndCourse(studentId, courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ? LIMIT 1';
            const rows = await conn.query(sql, [studentId, courseId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = EnrollmentRepository;
