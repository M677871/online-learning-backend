class Course {
    constructor(courseId, instructorId, categorieId, courseName, description, createdAt) {
        this.courseId = courseId;
        this.instructorId = instructorId;
        this.categorieId = categorieId;
        this.courseName = courseName;
        this.description = description;
        this.createdAt = createdAt;
    }

    static fromRow(row) {
        return new Course(
            row.course_id,
            row.instructor_id,
            row.categorie_id,
            row.course_name,
            row.description,
            row.create_at
        );
    }
}

module.exports = Course;
