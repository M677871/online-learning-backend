const { query } = require('../db/pool');

class QuizQuestionRepository {
  static async createQuizQuestion({ quizId, questionText }) {
    const sql = 'INSERT INTO quiz_questions (quiz_id, question_text, created_at) VALUES (?, ?, NOW())';
    const result = await query(sql, [quizId, questionText]);
    return Number(result.insertId);
  }

  static async getQuizQuestionById(questionId) {
    const sql = 'SELECT * FROM quiz_questions WHERE question_id = ?';
    const rows = await query(sql, [questionId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllQuizQuestions() {
    const sql = 'SELECT * FROM quiz_questions';
    return query(sql);
  }

  static async updateQuizQuestion(questionId, { quizId, questionText }) {
    const sql = 'UPDATE quiz_questions SET quiz_id=?, question_text=? WHERE question_id=?';
    const result = await query(sql, [quizId, questionText, questionId]);
    return result.affectedRows;
  }

  static async deleteQuizQuestion(questionId) {
    const sql = 'DELETE FROM quiz_questions WHERE question_id = ?';
    const result = await query(sql, [questionId]);
    return result.affectedRows;
  }

  static async questionExists(questionId) {
    const sql = 'SELECT 1 FROM quiz_questions WHERE question_id = ? LIMIT 1';
    const rows = await query(sql, [questionId]);
    return rows.length > 0;
  }
}

module.exports = QuizQuestionRepository;
