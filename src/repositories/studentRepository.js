const { query } = require('../db/pool');

class StudentRepository {
  static async createStudent({ userId, stuFName, stuLName, dob, profilePicture }) {
    const sql = 'INSERT INTO students (user_id, stu_FName, stu_LName, dob, profile_picture) VALUES (?, ?, ?, ?, ?)';
    const result = await query(sql, [userId, stuFName, stuLName, dob, profilePicture]);
    return Number(result.insertId);
  }

  static async getStudentById(studentId) {
    const sql = 'SELECT * FROM students WHERE studend_id = ?';
    const rows = await query(sql, [studentId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllStudents() {
    const sql = 'SELECT * FROM students';
    return query(sql);
  }

  static async updateStudent(studentId, { userId, stuFName, stuLName, dob, profilePicture }) {
    const sql = 'UPDATE students SET user_id=?, stu_FName=?, stu_LName=?, dob=?, profile_picture=? WHERE studend_id=?';
    const result = await query(sql, [userId, stuFName, stuLName, dob, profilePicture, studentId]);
    return result.affectedRows;
  }

  static async deleteStudent(studentId) {
    const sql = 'DELETE FROM students WHERE studend_id = ?';
    const result = await query(sql, [studentId]);
    return result.affectedRows;
  }

  static async studentExists(studentId) {
    const sql = 'SELECT 1 FROM students WHERE studend_id = ? LIMIT 1';
    const rows = await query(sql, [studentId]);
    return rows.length > 0;
  }

  static async getStudentByUserId(userId) {
    const sql = 'SELECT * FROM students WHERE user_id = ?';
    const rows = await query(sql, [userId]);
    return rows.length ? rows[0] : null;
  }

  static async studentExistsByUserId(userId) {
    const sql = 'SELECT 1 FROM students WHERE user_id = ? LIMIT 1';
    const rows = await query(sql, [userId]);
    return rows.length > 0;
  }

  static async getStudentCourses(studentId) {
    const sql = `SELECT c.* FROM courses c
                 JOIN enrollments e ON c.course_id = e.course_id
                 WHERE e.student_id = ?`;
    return query(sql, [studentId]);
  }
}

module.exports = StudentRepository;
