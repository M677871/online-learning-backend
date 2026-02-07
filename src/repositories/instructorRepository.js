const { query } = require('../db/pool');

class InstructorRepository {
  static async createInstructor({ userId, insFName, insLName, bio, profilePicture }) {
    const sql = 'INSERT INTO instructors (user_id, ins_FName, ins_LName, bio, profile_picture) VALUES (?, ?, ?, ?, ?)';
    const result = await query(sql, [userId, insFName, insLName, bio, profilePicture]);
    return Number(result.insertId);
  }

  static async getInstructorById(instructorId) {
    const sql = 'SELECT * FROM instructors WHERE instructor_id = ?';
    const rows = await query(sql, [instructorId]);
    return rows.length ? rows[0] : null;
  }

  static async getAllInstructors() {
    const sql = 'SELECT * FROM instructors';
    return query(sql);
  }

  static async updateInstructor(instructorId, { userId, insFName, insLName, bio, profilePicture }) {
    const sql = 'UPDATE instructors SET user_id=?, ins_FName=?, ins_LName=?, bio=?, profile_picture=? WHERE instructor_id=?';
    const result = await query(sql, [userId, insFName, insLName, bio, profilePicture, instructorId]);
    return result.affectedRows;
  }

  static async deleteInstructor(instructorId) {
    const sql = 'DELETE FROM instructors WHERE instructor_id = ?';
    const result = await query(sql, [instructorId]);
    return result.affectedRows;
  }

  static async instructorExists(instructorId) {
    const sql = 'SELECT 1 FROM instructors WHERE instructor_id = ? LIMIT 1';
    const rows = await query(sql, [instructorId]);
    return rows.length > 0;
  }

  static async getInstructorByUserId(userId) {
    const sql = 'SELECT * FROM instructors WHERE user_id = ?';
    const rows = await query(sql, [userId]);
    return rows.length ? rows[0] : null;
  }

  static async instructorExistsByUserId(userId) {
    const sql = 'SELECT 1 FROM instructors WHERE user_id = ? LIMIT 1';
    const rows = await query(sql, [userId]);
    return rows.length > 0;
  }

  static async getInstructorCourses(instructorId) {
    const sql = 'SELECT * FROM courses WHERE instructor_id = ?';
    return query(sql, [instructorId]);
  }
}

module.exports = InstructorRepository;
