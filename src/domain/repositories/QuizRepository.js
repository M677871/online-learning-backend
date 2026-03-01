const pool = require('../../config/db');
const Quiz = require('../entities/Quiz');

class QuizRepository {
    static async createQuiz({ courseId, quizName, quizDescription }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO quizzes (course_id, quiz_name, quiz_description, created_at) VALUES (?, ?, ?, NOW())';
            const result = await conn.query(sql, [courseId, quizName, quizDescription]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getQuizById(quizId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quizzes WHERE quiz_id = ?';
            const rows = await conn.query(sql, [quizId]);
            return rows.length ? Quiz.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllQuizzes() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quizzes';
            const rows = await conn.query(sql);
            return rows.map(row => Quiz.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateQuiz(quizId, { courseId, quizName, quizDescription }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE quizzes SET course_id=?, quiz_name=?, quiz_description=? WHERE quiz_id=?';
            const result = await conn.query(sql, [courseId, quizName, quizDescription, quizId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteQuiz(quizId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM quizzes WHERE quiz_id = ?';
            const result = await conn.query(sql, [quizId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async quizExists(quizId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM quizzes WHERE quiz_id = ? LIMIT 1';
            const rows = await conn.query(sql, [quizId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getQuizzesByCourseId(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quizzes WHERE course_id = ?';
            const rows = await conn.query(sql, [courseId]);
            return rows.map(row => Quiz.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async getQuizzesByStudentId(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `
                SELECT q.quiz_id, q.quiz_name, q.quiz_description, q.created_at, c.course_name
                FROM quizzes q
                JOIN courses c ON q.course_id = c.course_id
                JOIN enrollments e ON c.course_id = e.course_id
                WHERE e.student_id = ?`;
            const rows = await conn.query(sql, [studentId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = QuizRepository;
