const { query } = require('../db/pool');

class QuizRepository {
  static async createQuiz({ courseId, quizName, quizDescription }) {
    const sql = 'INSERT INTO quizzes (course_id, quiz_name, quiz_description, created_at) VALUES (?, ?, ?, NOW())';
    const result = await query(sql, [courseId, quizName, quizDescription]);
    return Number(result.insertId);
  }

  static async getQuizById(quizId) {
    const sql = 'SELECT * FROM quizzes WHERE quiz_id = ?';
    const rows = await query(sql, [quizId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllQuizzes() {
    const sql = 'SELECT * FROM quizzes';
    return query(sql);
  }

  static async updateQuiz(quizId, { courseId, quizName, quizDescription }) {
    const sql = 'UPDATE quizzes SET course_id=?, quiz_name=?, quiz_description=? WHERE quiz_id=?';
    const result = await query(sql, [courseId, quizName, quizDescription, quizId]);
    return result.affectedRows;
  }

  static async deleteQuiz(quizId) {
    const sql = 'DELETE FROM quizzes WHERE quiz_id = ?';
    const result = await query(sql, [quizId]);
    return result.affectedRows;
  }

  static async quizExists(quizId) {
    const sql = 'SELECT 1 FROM quizzes WHERE quiz_id = ? LIMIT 1';
    const rows = await query(sql, [quizId]);
    return rows.length > 0;
  }

  static async getQuizzesByCourseId(courseId) {
    const sql = 'SELECT * FROM quizzes WHERE course_id = ?';
    return query(sql, [courseId]);
  }

  static async getQuizzesByStudentId(studentId) {
    const sql = `
      SELECT q.quiz_id, q.quiz_name, q.quiz_description, q.created_at, c.course_name
      FROM quizzes q
      JOIN courses c ON q.course_id = c.course_id
      JOIN enrollments e ON c.course_id = e.course_id
      WHERE e.student_id = ?`;
    return query(sql, [studentId]);
  }
}

module.exports = QuizRepository;
