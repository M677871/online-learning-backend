class EnrollmentDTO {
    constructor(enrollmentId, studentId, courseId, status, enrolledAt) {
        this.enrollmentId = enrollmentId;
        this.studentId = studentId;
        this.courseId = courseId;
        this.status = status;
        this.enrolledAt = enrolledAt;
    }

    static fromEntity(entity) {
        return new EnrollmentDTO(
            entity.enrollmentId,
            entity.studentId,
            entity.courseId,
            entity.status,
            entity.enrolledAt
        );
    }
}

module.exports = EnrollmentDTO;
