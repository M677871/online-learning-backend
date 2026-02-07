const { query } = require('../db/pool');

class QuizResultRepository {
  static async createQuizResult({ quizId, studentId, score }) {
    const sql = 'INSERT INTO quiz_results (quiz_id, student_id, score, completed_at) VALUES (?, ?, ?, NOW())';
    const result = await query(sql, [quizId, studentId, score]);
    return Number(result.insertId);
  }

  static async getQuizResultById(resultId) {
    const sql = 'SELECT * FROM quiz_results WHERE result_id = ?';
    const rows = await query(sql, [resultId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllQuizResults() {
    const sql = 'SELECT * FROM quiz_results';
    return query(sql);
  }

  static async updateQuizResult(resultId, { quizId, studentId, score }) {
    const sql = 'UPDATE quiz_results SET quiz_id=?, student_id=?, score=? WHERE result_id=?';
    const result = await query(sql, [quizId, studentId, score, resultId]);
    return result.affectedRows;
  }

  static async deleteQuizResult(resultId) {
    const sql = 'DELETE FROM quiz_results WHERE result_id = ?';
    const result = await query(sql, [resultId]);
    return result.affectedRows;
  }

  static async resultExists(resultId) {
    const sql = 'SELECT 1 FROM quiz_results WHERE result_id = ? LIMIT 1';
    const rows = await query(sql, [resultId]);
    return rows.length > 0;
  }

  static async resultExistsByStudentAndQuiz(studentId, quizId) {
    const sql = 'SELECT 1 FROM quiz_results WHERE student_id = ? AND quiz_id = ? LIMIT 1';
    const rows = await query(sql, [studentId, quizId]);
    return rows.length > 0;
  }
}

module.exports = QuizResultRepository;
