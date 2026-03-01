const pool = require('../../config/db');
const QuizQuestion = require('../entities/QuizQuestion');

class QuizQuestionRepository {
    static async createQuizQuestion({ quizId, questionText }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO quiz_questions (quiz_id, question_text, created_at) VALUES (?, ?, NOW())';
            const result = await conn.query(sql, [quizId, questionText]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getQuizQuestionById(questionId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quiz_questions WHERE question_id = ?';
            const rows = await conn.query(sql, [questionId]);
            return rows.length ? QuizQuestion.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllQuizQuestions() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quiz_questions';
            const rows = await conn.query(sql);
            return rows.map(row => QuizQuestion.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateQuizQuestion(questionId, { quizId, questionText }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE quiz_questions SET quiz_id=?, question_text=? WHERE question_id=?';
            const result = await conn.query(sql, [quizId, questionText, questionId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteQuizQuestion(questionId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM quiz_questions WHERE question_id = ?';
            const result = await conn.query(sql, [questionId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async questionExists(questionId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM quiz_questions WHERE question_id = ? LIMIT 1';
            const rows = await conn.query(sql, [questionId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = QuizQuestionRepository;
