class Quiz {
    constructor(quizId, courseId, quizName, quizDescription, createdAt) {
        this.quizId = quizId;
        this.courseId = courseId;
        this.quizName = quizName;
        this.quizDescription = quizDescription;
        this.createdAt = createdAt;
    }

    static fromRow(row) {
        return new Quiz(
            row.quiz_id,
            row.course_id,
            row.quiz_name,
            row.quiz_description,
            row.created_at
        );
    }
}

module.exports = Quiz;
