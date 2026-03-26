const pool = require('../../config/db');
const Course = require('../entities/Course');

/**
 * Data access layer for Course entities.
 */
class CourseRepository {
    /**
     * Inserts a new course.
     * @param {Object} params
     * @param {number|string} params.instructorId - ID of the instructor.
     * @param {number|string} params.categorieId - ID of the category.
     * @param {string} params.courseName - The name of the course.
     * @param {string} params.description - Course description.
     * @returns {Promise<number>} The newly created course ID.
     */
    static async createCourse({ instructorId, categorieId, courseName, description }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `INSERT INTO courses (instructor_id, categorie_id, course_name, description, create_at) VALUES (?, ?, ?, ?, NOW())`;
            const result = await conn.query(sql, [instructorId, categorieId, courseName, description]);
            return Number(result.insertId);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves a single course by its ID.
     * @param {number|string} courseId - The course ID.
     * @returns {Promise<Course|null>} The mapped course entity, or null.
     */
    static async getCourseById(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM courses WHERE course_id = ?';
            const rows = await conn.query(sql, [courseId]);
            return rows.length ? Course.fromRow(rows[0]) : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves all courses.
     * @returns {Promise<Course[]>} Array of Course entities.
     */
    static async getAllCourses() {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM courses';
            const rows = await conn.query(sql);
            return rows.map(row => Course.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Updates an existing course.
     * @param {number|string} courseId - The course ID to update.
     * @param {Object} params
     * @param {number|string} params.instructorId - New instructor ID.
     * @param {number|string} params.categorieId - New category ID.
     * @param {string} params.courseName - New course name.
     * @param {string} params.description - New course description.
     * @returns {Promise<number>} Affected rows count.
     */
    static async updateCourse(courseId, { instructorId, categorieId, courseName, description }) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `UPDATE courses SET instructor_id=?, categorie_id=?, course_name=?, description=? WHERE course_id=?`;
            const result = await conn.query(sql, [instructorId, categorieId, courseName, description, courseId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Deletes a course.
     * @param {number|string} courseId - The ID of the course.
     * @returns {Promise<number>} Affected rows count.
     */
    static async deleteCourse(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'DELETE FROM courses WHERE course_id = ?';
            const result = await conn.query(sql, [courseId]);
            return result.affectedRows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Checks if a course exists by its ID.
     * @param {number|string} courseId - The course ID.
     * @returns {Promise<boolean>} True if found, false otherwise.
     */
    static async courseExistsById(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT 1 FROM courses WHERE course_id = ? LIMIT 1';
            const rows = await conn.query(sql, [courseId]);
            return rows.length > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves the instructor assigned to a specific course.
     * @param {number|string} courseId - The course ID.
     * @returns {Promise<Object|null>} Instructor record or null.
     */
    static async getInstructorByCourseId(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `SELECT i.* FROM instructors i
                         JOIN courses c ON c.instructor_id = i.instructor_id
                         WHERE c.course_id = ?`;
            const rows = await conn.query(sql, [courseId]);
            return rows.length ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves all students enrolled in a specific course.
     * @param {number|string} courseId - The course ID.
     * @returns {Promise<Object[]>} Array of student records.
     */
    static async getStudentsOfCourse(courseId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `SELECT s.* FROM students s
                         JOIN enrollments e ON s.studend_id = e.student_id
                         WHERE e.course_id = ?`;
            const rows = await conn.query(sql, [courseId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves all courses assigned to a specific instructor.
     * @param {number|string} instructorId - The instructor ID.
     * @returns {Promise<Course[]>} Array of Course entities.
     */
    static async getCoursesByInstructorId(instructorId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = 'SELECT * FROM courses WHERE instructor_id = ?';
            const rows = await conn.query(sql, [instructorId]);
            return rows.map(row => Course.fromRow(row));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retrieves detailed information about all courses a student is enrolled in.
     * @param {number|string} studentId - The student ID.
     * @returns {Promise<Object[]>} Enrolled course details including instructor information.
     */
    static async getStudentEnrolledCourses(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `
                SELECT c.course_id, c.course_name, c.description, c.create_at,
                       i.ins_FName, i.ins_LName, u.email AS instructor_email
                FROM courses c
                JOIN enrollments e ON c.course_id = e.course_id
                JOIN instructors i ON c.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                WHERE e.student_id = ?`;
            const rows = await conn.query(sql, [studentId]);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = CourseRepository;
