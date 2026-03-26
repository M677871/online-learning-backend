const pool = require('../../config/db');
const Instructor = require('../entities/Instructor');

/**
 * Repository class for managing instructor data in the database.
 */
class InstructorRepository {
    /**
     * Inserts a new instructor record.
     * @param {Object} data - Instructor data.
     * @param {number} data.userId - Foreign key to the user.
     * @param {string} data.insFName - Instructor's first name.
     * @param {string} data.insLName - Instructor's last name.
     * @param {string} [data.bio] - Short biography.
     * @param {string} [data.profilePicture] - URL to profile picture.
     * @returns {Promise<number>} The newly created instructor ID.
     */
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

    /**
     * Retrieves an instructor by their ID.
     * @param {number|string} instructorId - The primary key of the instructor.
     * @returns {Promise<Instructor|null>} An Instructor instance or null if not found.
     */
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

    /**
     * Retrieves all instructors from the database.
     * @returns {Promise<Array<Instructor>>} A list of all instructors.
     */
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

    /**
     * Updates an instructor's details.
     * @param {number|string} instructorId - The instructor's ID.
     * @param {Object} data - Updated instructor data.
     * @param {number} data.userId - Associated user ID.
     * @param {string} data.insFName - Instructor's first name.
     * @param {string} data.insLName - Instructor's last name.
     * @param {string} [data.bio] - Short biography.
     * @param {string} [data.profilePicture] - URL to profile picture.
     * @returns {Promise<number>} Number of affected rows.
     */
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

    /**
     * Deletes an instructor by ID.
     * @param {number|string} instructorId - The ID to delete.
     * @returns {Promise<number>} Number of affected rows.
     */
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

    /**
     * Checks if an instructor exists by ID.
     * @param {number|string} instructorId - The ID to check.
     * @returns {Promise<boolean>} True if the instructor exists, false otherwise.
     */
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

    /**
     * Retrieves an instructor by their associated user ID.
     * @param {number|string} userId - The user account ID.
     * @returns {Promise<Instructor|null>} The Instructor instance or null.
     */
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

    /**
     * Checks if an instructor exists by user ID.
     * @param {number|string} userId - The user ID to look up.
     * @returns {Promise<boolean>} True if an instructor profile exists for the user.
     */
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

    /**
     * Retrieves courses assigned to the specified instructor.
     * @param {number|string} instructorId - The instructor ID.
     * @returns {Promise<Array<Object>>} A list of raw course records.
     */
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
