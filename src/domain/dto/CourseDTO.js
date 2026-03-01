class CourseDTO {
    constructor(courseId, instructorId, categorieId, courseName, description, createdAt) {
        this.courseId = courseId;
        this.instructorId = instructorId;
        this.categorieId = categorieId;
        this.courseName = courseName;
        this.description = description;
        this.createdAt = createdAt;
    }

    static fromEntity(entity) {
        return new CourseDTO(
            entity.courseId,
            entity.instructorId,
            entity.categorieId,
            entity.courseName,
            entity.description,
            entity.createdAt
        );
    }
}

module.exports = CourseDTO;
