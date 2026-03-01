const pool = require('../../config/db');
const Instructor = require('../entities/Instructor');

class InstructorRepository {
    static async createInstructor({ userId, insFName, insLName, bio, profilePicture }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'INSERT INTO instructors (user_id, ins_FName, ins_LName, bio, profile_picture) VALUES (?, ?, ?, ?, ?)';
            const result = await conn.query(sql, [userId, insFName, insLName, bio, profilePicture]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    static async getInstructorById(instructorId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM instructors WHERE instructor_id = ?';
            const rows = await conn.query(sql, [instructorId]);
            return rows.length ? Instructor.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllInstructors() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM instructors';
            const rows = await conn.query(sql);
            return rows.map(row => Instructor.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateInstructor(instructorId, { userId, insFName, insLName, bio, profilePicture }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'UPDATE instructors SET user_id=?, ins_FName=?, ins_LName=?, bio=?, profile_picture=? WHERE instructor_id=?';
            const result = await conn.query(sql, [userId, insFName, insLName, bio, profilePicture, instructorId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteInstructor(instructorId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM instructors WHERE instructor_id = ?';
            const result = await conn.query(sql, [instructorId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    static async instructorExists(instructorId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM instructors WHERE instructor_id = ? LIMIT 1';
            const rows = await conn.query(sql, [instructorId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getInstructorByUserId(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM instructors WHERE user_id = ?';
            const rows = await conn.query(sql, [userId]);
            return rows.length ? Instructor.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async instructorExistsByUserId(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM instructors WHERE user_id = ? LIMIT 1';
            const rows = await conn.query(sql, [userId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getInstructorCourses(instructorId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM courses WHERE instructor_id = ?';
            const rows = await conn.query(sql, [instructorId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = InstructorRepository;
