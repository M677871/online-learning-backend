const { query } = require('../db/pool');

class UserRepository {
  /**
   * Insert a new user. Expects a pre-hashed password.
   * @param {{ email: string, passwordHash: string, userType: string }} data
   * @returns {Promise<number>} Inserted user ID
   */
  static async createUser({ email, passwordHash, userType }) {
    const sql = `INSERT INTO users (email, password_hash, user_type, create_at) VALUES (?, ?, ?, NOW())`;
    const result = await query(sql, [email, passwordHash, userType]);
    return Number(result.insertId);
  }

  /**
   * @param {number} userId
   * @returns {Promise<object|null>} Raw DB row or null
   */
  static async getUserById(userId) {
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    const rows = await query(sql, [userId]);
    return rows.length ? rows[0] : null;
  }

  /**
   * @param {string} email
   * @returns {Promise<object|null>} Raw DB row or null
   */
  static async getUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const rows = await query(sql, [email]);
    return rows.length ? rows[0] : null;
  }

  /**
   * @returns {Promise<object[]>} All user rows
   */
  static async getAllUsers() {
    const sql = 'SELECT * FROM users';
    return query(sql);
  }

  /**
   * Partial update — only provided fields are changed.
   * @param {number} userId
   * @param {{ email?: string, passwordHash?: string, userType?: string }} fields
   * @returns {Promise<number>} Affected rows
   */
  static async updateUser(userId, fields) {
    const setClauses = [];
    const params = [];

    if (fields.email !== undefined) {
      setClauses.push('email = ?');
      params.push(fields.email);
    }
    if (fields.passwordHash !== undefined) {
      setClauses.push('password_hash = ?');
      params.push(fields.passwordHash);
    }
    if (fields.userType !== undefined) {
      setClauses.push('user_type = ?');
      params.push(fields.userType);
    }

    if (setClauses.length === 0) return 0;

    params.push(userId);
    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE user_id = ?`;
    const result = await query(sql, params);
    return result.affectedRows;
  }

  /**
   * @param {number} userId
   * @returns {Promise<number>} Affected rows
   */
  static async deleteUser(userId) {
    const sql = 'DELETE FROM users WHERE user_id = ?';
    const result = await query(sql, [userId]);
    return result.affectedRows;
  }

  /**
   * @param {string} email
   * @param {number} [excludeUserId] - Optionally exclude a user (for update uniqueness checks)
   * @returns {Promise<boolean>}
   */
  static async emailExists(email, excludeUserId = null) {
    let sql = 'SELECT 1 FROM users WHERE email = ?';
    const params = [email];
    if (excludeUserId !== null) {
      sql += ' AND user_id != ?';
      params.push(excludeUserId);
    }
    sql += ' LIMIT 1';
    const rows = await query(sql, params);
    return rows.length > 0;
  }

  /**
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  static async userExistsById(userId) {
    const sql = 'SELECT 1 FROM users WHERE user_id = ? LIMIT 1';
    const rows = await query(sql, [userId]);
    return rows.length > 0;
  }

  /**
   * Update only the password hash for a user.
   * @param {number} userId
   * @param {string} passwordHash - Pre-hashed password
   * @returns {Promise<number>} Affected rows
   */
  static async updatePasswordHash(userId, passwordHash) {
    const sql = 'UPDATE users SET password_hash = ? WHERE user_id = ?';
    const result = await query(sql, [passwordHash, userId]);
    return result.affectedRows;
  }
}

module.exports = UserRepository;
