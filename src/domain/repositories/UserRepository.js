const pool = require('../../config/db');
const User = require('../entities/User');

/**
 * Data access layer for User entities.
 * Handles all database operations related to the users table.
 */
class UserRepository {
    /**
     * Inserts a new user into the database.
     * @param {Object} params
     * @param {string} params.email - The user's email address.
     * @param {string} params.passwordHash - The naturally hashed password.
     * @param {string} params.userType - The user role/type (e.g. 'student', 'instructor').
     * @returns {Promise<number>} The auto-generated database ID for the new user.
     */
    static async createUser({ email, passwordHash, userType }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `INSERT INTO users (email, password_hash, user_type, create_at) VALUES (?, ?, ?, NOW())`;
            const result = await conn.query(sql, [email, passwordHash, userType]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves a user from the database by ID and maps it to a domain entity.
     * @param {number|string} userId - The user ID.
     * @returns {Promise<User|null>} The mapped User entity, or null if not found.
     */
    static async getUserById(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM users WHERE user_id = ?';
            const rows = await conn.query(sql, [userId]);
            return rows.length ? User.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves a user from the database by email. Returns raw database row.
     * @param {string} email - The user email.
     * @returns {Promise<Object|null>} The raw data row for the user, or null if not found.
     */
    static async getUserByEmail(email) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM users WHERE email = ?';
            const rows = await conn.query(sql, [email]);
            return rows.length ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves all users from the database.
     * @returns {Promise<User[]>} Array of User domain entities.
     */
    static async getAllUsers() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM users';
            const rows = await conn.query(sql);
            return rows.map(row => User.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Updates specific fields of an existing user.
     * @param {number|string} userId - The user ID to update.
     * @param {Object} fields - Key-value pairs matching database fields to update.
     * @param {string} [fields.email] - Updated email address.
     * @param {string} [fields.passwordHash] - Updated password hash.
     * @param {string} [fields.userType] - Updated user role.
     * @returns {Promise<number>} Number of affected rows.
     */
    static async updateUser(userId, fields) {
        let conn;
        try {
            conn = await pool.getConnection();
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
            const result = await conn.query(sql, params);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Deletes a user from the database.
     * @param {number|string} userId - The user ID to delete.
     * @returns {Promise<number>} Number of affected rows.
     */
    static async deleteUser(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM users WHERE user_id = ?';
            const result = await conn.query(sql, [userId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Checks if a given email is already in use by any user.
     * Can optionally exclude a specific user ID (useful during updates).
     * @param {string} email - The email to check.
     * @param {number|string|null} [excludeUserId=null] - User ID to exclude from the check.
     * @returns {Promise<boolean>} True if the email exists, false otherwise.
     */
    static async emailExists(email, excludeUserId = null) {
        let conn;
        try {
            conn = await pool.getConnection();
            let sql = 'SELECT 1 FROM users WHERE email = ?';
            const params = [email];
            if (excludeUserId !== null) {
                sql += ' AND user_id != ?';
                params.push(excludeUserId);
            }
            sql += ' LIMIT 1';
            const rows = await conn.query(sql, params);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Checks if a user exists by their ID.
     * @param {number|string} userId - The user ID to check.
     * @returns {Promise<boolean>} True if the user exists, false otherwise.
     */
    static async userExistsById(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM users WHERE user_id = ? LIMIT 1';
            const rows = await conn.query(sql, [userId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Direct update for a user's password hash.
     * @param {number|string} userId - The target user ID.
     * @param {string} passwordHash - The new hashed password.
     * @returns {Promise<number>} Number of affected rows.
     */
    static async updatePasswordHash(userId, passwordHash) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE users SET password_hash = ? WHERE user_id = ?';
            const result = await conn.query(sql, [passwordHash, userId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = UserRepository;
