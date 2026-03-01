const pool = require('../../config/db');
const Student = require('../entities/Student');

class StudentRepository {
    static async createStudent({ userId, stuFName, stuLName, dob, profilePicture }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO students (user_id, stu_FName, stu_LName, dob, profile_picture) VALUES (?, ?, ?, ?, ?)';
            const result = await conn.query(sql, [userId, stuFName, stuLName, dob, profilePicture]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getStudentById(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM students WHERE studend_id = ?';
            const rows = await conn.query(sql, [studentId]);
            return rows.length ? Student.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllStudents() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM students';
            const rows = await conn.query(sql);
            return rows.map(row => Student.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateStudent(studentId, { userId, stuFName, stuLName, dob, profilePicture }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE students SET user_id=?, stu_FName=?, stu_LName=?, dob=?, profile_picture=? WHERE studend_id=?';
            const result = await conn.query(sql, [userId, stuFName, stuLName, dob, profilePicture, studentId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteStudent(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM students WHERE studend_id = ?';
            const result = await conn.query(sql, [studentId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async studentExists(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM students WHERE studend_id = ? LIMIT 1';
            const rows = await conn.query(sql, [studentId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getStudentByUserId(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM students WHERE user_id = ?';
            const rows = await conn.query(sql, [userId]);
            return rows.length ? Student.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async studentExistsByUserId(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM students WHERE user_id = ? LIMIT 1';
            const rows = await conn.query(sql, [userId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getStudentCourses(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `SELECT c.* FROM courses c
                         JOIN enrollments e ON c.course_id = e.course_id
                         WHERE e.student_id = ?`;
            const rows = await conn.query(sql, [studentId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = StudentRepository;
