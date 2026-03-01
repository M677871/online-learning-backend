const pool = require('../../config/db');
const QuizResult = require('../entities/QuizResult');

class QuizResultRepository {
    static async createQuizResult({ quizId, studentId, score }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO quiz_results (quiz_id, student_id, score, completed_at) VALUES (?, ?, ?, NOW())';
            const result = await conn.query(sql, [quizId, studentId, score]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getQuizResultById(resultId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quiz_results WHERE result_id = ?';
            const rows = await conn.query(sql, [resultId]);
            return rows.length ? QuizResult.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllQuizResults() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quiz_results';
            const rows = await conn.query(sql);
            return rows.map(row => QuizResult.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateQuizResult(resultId, { quizId, studentId, score }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE quiz_results SET quiz_id=?, student_id=?, score=? WHERE result_id=?';
            const result = await conn.query(sql, [quizId, studentId, score, resultId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteQuizResult(resultId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM quiz_results WHERE result_id = ?';
            const result = await conn.query(sql, [resultId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async resultExists(resultId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM quiz_results WHERE result_id = ? LIMIT 1';
            const rows = await conn.query(sql, [resultId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async resultExistsByStudentAndQuiz(studentId, quizId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM quiz_results WHERE student_id = ? AND quiz_id = ? LIMIT 1';
            const rows = await conn.query(sql, [studentId, quizId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = QuizResultRepository;
