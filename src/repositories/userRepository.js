const { query } = require('../db/pool');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

class UserRepository {
  static async createUser({ email, password, userType }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const sql = `INSERT INTO users (email, password_hash, user_type, create_at) VALUES (?, ?, ?, NOW())`;
    const result = await query(sql, [email, hashedPassword, userType]);
    return result.insertId !== undefined ? Number(result.insertId) : result.affectedRows;
  }

  static async getUserById(userId) {
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    const rows = await query(sql, [userId]);
    return rows.length ? rows[0] : null;
  }

  static async getUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const rows = await query(sql, [email]);
    return rows.length ? rows[0] : null;
  }

  static async getAllUsers() {
    const sql = 'SELECT user_id, email, user_type, create_at FROM users';
    return query(sql);
  }

  static async updateUser(userId, { email, password, userType }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const sql = `UPDATE users SET email = ?, password_hash = ?, user_type = ? WHERE user_id = ?`;
    const result = await query(sql, [email, hashedPassword, userType, userId]);
    return result.affectedRows;
  }

  static async deleteUser(userId) {
    const sql = 'DELETE FROM users WHERE user_id = ?';
    const result = await query(sql, [userId]);
    return result.affectedRows;
  }

  static async emailExists(email) {
    const sql = 'SELECT 1 FROM users WHERE email = ? LIMIT 1';
    const rows = await query(sql, [email]);
    return rows.length > 0;
  }

  static async userExistsById(userId) {
    const sql = 'SELECT 1 FROM users WHERE user_id = ? LIMIT 1';
    const rows = await query(sql, [userId]);
    return rows.length > 0;
  }

  static async changePassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const sql = 'UPDATE users SET password_hash = ? WHERE email = ?';
    const result = await query(sql, [hashedPassword, email]);
    return result.affectedRows;
  }
}

module.exports = UserRepository;
