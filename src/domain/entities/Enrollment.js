class Enrollment {
    constructor(enrollmentId, studentId, courseId, status, enrolledAt) {
        this.enrollmentId = enrollmentId;
        this.studentId = studentId;
        this.courseId = courseId;
        this.status = status;
        this.enrolledAt = enrolledAt;
    }

    static fromRow(row) {
        return new Enrollment(
            row.enrollment_id,
            row.student_id,
            row.course_id,
            row.status,
            row.enrolled_at
        );
    }
}

module.exports = Enrollment;
