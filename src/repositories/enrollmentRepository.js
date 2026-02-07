const { query } = require('../db/pool');

class EnrollmentRepository {
  static async createEnrollment({ studentId, courseId, status }) {
    const sql = 'INSERT INTO enrollments (student_id, course_id, status, enrolled_at) VALUES (?, ?, ?, NOW())';
    const result = await query(sql, [studentId, courseId, status]);
    return Number(result.insertId);
  }

  static async getEnrollmentById(enrollmentId) {
    const sql = 'SELECT * FROM enrollments WHERE enrollment_id = ?';
    const rows = await query(sql, [enrollmentId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllEnrollments() {
    const sql = 'SELECT * FROM enrollments';
    return query(sql);
  }

  static async updateEnrollment(enrollmentId, { studentId, courseId, status }) {
    const sql = 'UPDATE enrollments SET student_id=?, course_id=?, status=? WHERE enrollment_id=?';
    const result = await query(sql, [studentId, courseId, status, enrollmentId]);
    return result.affectedRows;
  }

  static async deleteEnrollment(enrollmentId) {
    const sql = 'DELETE FROM enrollments WHERE enrollment_id = ?';
    const result = await query(sql, [enrollmentId]);
    return result.affectedRows;
  }

  static async enrollmentExists(enrollmentId) {
    const sql = 'SELECT 1 FROM enrollments WHERE enrollment_id = ? LIMIT 1';
    const rows = await query(sql, [enrollmentId]);
    return rows.length > 0;
  }

  static async enrollmentExistsByStudentAndCourse(studentId, courseId) {
    const sql = 'SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ? LIMIT 1';
    const rows = await query(sql, [studentId, courseId]);
    return rows.length > 0;
  }
}

module.exports = EnrollmentRepository;
