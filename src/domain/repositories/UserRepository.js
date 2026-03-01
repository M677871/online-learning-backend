const pool = require('../../config/db');
const User = require('../entities/User');

class UserRepository {
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
