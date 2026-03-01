const pool = require('../../config/db');
const Course = require('../entities/Course');

class CourseRepository {
    static async createCourse({ instructorId, categorieId, courseName, description }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `INSERT INTO courses (instructor_id, categorie_id, course_name, description, create_at) VALUES (?, ?, ?, ?, NOW())`;
            const result = await conn.query(sql, [instructorId, categorieId, courseName, description]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getCourseById(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM courses WHERE course_id = ?';
            const rows = await conn.query(sql, [courseId]);
            return rows.length ? Course.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllCourses() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM courses';
            const rows = await conn.query(sql);
            return rows.map(row => Course.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateCourse(courseId, { instructorId, categorieId, courseName, description }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `UPDATE courses SET instructor_id=?, categorie_id=?, course_name=?, description=? WHERE course_id=?`;
            const result = await conn.query(sql, [instructorId, categorieId, courseName, description, courseId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteCourse(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM courses WHERE course_id = ?';
            const result = await conn.query(sql, [courseId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async courseExistsById(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM courses WHERE course_id = ? LIMIT 1';
            const rows = await conn.query(sql, [courseId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getInstructorByCourseId(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `SELECT i.* FROM instructors i
                         JOIN courses c ON c.instructor_id = i.instructor_id
                         WHERE c.course_id = ?`;
            const rows = await conn.query(sql, [courseId]);
            return rows.length ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getStudentsOfCourse(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `SELECT s.* FROM students s
                         JOIN enrollments e ON s.studend_id = e.student_id
                         WHERE e.course_id = ?`;
            const rows = await conn.query(sql, [courseId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getCoursesByInstructorId(instructorId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM courses WHERE instructor_id = ?';
            const rows = await conn.query(sql, [instructorId]);
            return rows.map(row => Course.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async getStudentEnrolledCourses(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `
                SELECT c.course_id, c.course_name, c.description, c.create_at,
                       i.ins_FName, i.ins_LName, u.email AS instructor_email
                FROM courses c
                JOIN enrollments e ON c.course_id = e.course_id
                JOIN instructors i ON c.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                WHERE e.student_id = ?`;
            const rows = await conn.query(sql, [studentId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = CourseRepository;
