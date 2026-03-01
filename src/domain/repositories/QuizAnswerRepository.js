const pool = require('../../config/db');
const QuizAnswer = require('../entities/QuizAnswer');

class QuizAnswerRepository {
    static async createQuizAnswer({ questionId, answerText, answerType, isCorrect }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO quiz_answers (question_id, answer_text, answer_type, is_correct) VALUES (?, ?, ?, ?)';
            const result = await conn.query(sql, [questionId, answerText, answerType, isCorrect]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getQuizAnswerById(answerId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quiz_answers WHERE answer_id = ?';
            const rows = await conn.query(sql, [answerId]);
            return rows.length ? QuizAnswer.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllQuizAnswers() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM quiz_answers';
            const rows = await conn.query(sql);
            return rows.map(row => QuizAnswer.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateQuizAnswer(answerId, { questionId, answerText, answerType, isCorrect }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE quiz_answers SET question_id=?, answer_text=?, answer_type=?, is_correct=? WHERE answer_id=?';
            const result = await conn.query(sql, [questionId, answerText, answerType, isCorrect, answerId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteQuizAnswer(answerId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM quiz_answers WHERE answer_id = ?';
            const result = await conn.query(sql, [answerId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async answerExists(answerId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM quiz_answers WHERE answer_id = ? LIMIT 1';
            const rows = await conn.query(sql, [answerId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = QuizAnswerRepository;
