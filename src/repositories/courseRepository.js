const { query } = require('../db/pool');

class CourseRepository {
  static async createCourse({ instructorId, categorieId, courseName, description }) {
    const sql = `INSERT INTO courses (instructor_id, categorie_id, course_name, description, create_at) VALUES (?, ?, ?, ?, NOW())`;
    const result = await query(sql, [instructorId, categorieId, courseName, description]);
    return Number(result.insertId);
  }

  static async getCourseById(courseId) {
    const sql = 'SELECT * FROM courses WHERE course_id = ?';
    const rows = await query(sql, [courseId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllCourses() {
    const sql = 'SELECT * FROM courses';
    return query(sql);
  }

  static async updateCourse(courseId, { instructorId, categorieId, courseName, description }) {
    const sql = `UPDATE courses SET instructor_id=?, categorie_id=?, course_name=?, description=? WHERE course_id=?`;
    const result = await query(sql, [instructorId, categorieId, courseName, description, courseId]);
    return result.affectedRows;
  }

  static async deleteCourse(courseId) {
    const sql = 'DELETE FROM courses WHERE course_id = ?';
    const result = await query(sql, [courseId]);
    return result.affectedRows;
  }

  static async courseExistsById(courseId) {
    const sql = 'SELECT 1 FROM courses WHERE course_id = ? LIMIT 1';
    const rows = await query(sql, [courseId]);
    return rows.length > 0;
  }

  static async getInstructorByCourseId(courseId) {
    const sql = `SELECT i.* FROM instructors i
                 JOIN courses c ON c.instructor_id = i.instructor_id
                 WHERE c.course_id = ?`;
    const rows = await query(sql, [courseId]);
    return rows.length ? rows[0] : null;
  }

  static async getStudentsOfCourse(courseId) {
    const sql = `SELECT s.* FROM students s
                 JOIN enrollments e ON s.studend_id = e.student_id
                 WHERE e.course_id = ?`;
    return query(sql, [courseId]);
  }

  static async getCoursesByInstructorId(instructorId) {
    const sql = 'SELECT * FROM courses WHERE instructor_id = ?';
    return query(sql, [instructorId]);
  }

  static async getStudentEnrolledCourses(studentId) {
    const sql = `
      SELECT c.course_id, c.course_name, c.description, c.create_at,
             i.ins_FName, i.ins_LName, u.email AS instructor_email
      FROM courses c
      JOIN enrollments e ON c.course_id = e.course_id
      JOIN instructors i ON c.instructor_id = i.instructor_id
      JOIN users u ON i.user_id = u.user_id
      WHERE e.student_id = ?`;
    return query(sql, [studentId]);
  }
}

module.exports = CourseRepository;
