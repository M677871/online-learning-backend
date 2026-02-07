const { query } = require('../db/pool');

class QuizAnswerRepository {
  static async createQuizAnswer({ questionId, answerText, answerType, isCorrect }) {
    const sql = 'INSERT INTO quiz_answers (question_id, answer_text, answer_type, is_correct) VALUES (?, ?, ?, ?)';
    const result = await query(sql, [questionId, answerText, answerType, isCorrect]);
    return Number(result.insertId);
  }

  static async getQuizAnswerById(answerId) {
    const sql = 'SELECT * FROM quiz_answers WHERE answer_id = ?';
    const rows = await query(sql, [answerId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllQuizAnswers() {
    const sql = 'SELECT * FROM quiz_answers';
    return query(sql);
  }

  static async updateQuizAnswer(answerId, { questionId, answerText, answerType, isCorrect }) {
    const sql = 'UPDATE quiz_answers SET question_id=?, answer_text=?, answer_type=?, is_correct=? WHERE answer_id=?';
    const result = await query(sql, [questionId, answerText, answerType, isCorrect, answerId]);
    return result.affectedRows;
  }

  static async deleteQuizAnswer(answerId) {
    const sql = 'DELETE FROM quiz_answers WHERE answer_id = ?';
    const result = await query(sql, [answerId]);
    return result.affectedRows;
  }

  static async answerExists(answerId) {
    const sql = 'SELECT 1 FROM quiz_answers WHERE answer_id = ? LIMIT 1';
    const rows = await query(sql, [answerId]);
    return rows.length > 0;
  }
}

module.exports = QuizAnswerRepository;
