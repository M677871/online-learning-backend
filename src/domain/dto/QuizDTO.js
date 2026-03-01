class QuizDTO {
    constructor(quizId, courseId, quizName, quizDescription, createdAt) {
        this.quizId = quizId;
        this.courseId = courseId;
        this.quizName = quizName;
        this.quizDescription = quizDescription;
        this.createdAt = createdAt;
    }

    static fromEntity(entity) {
        return new QuizDTO(
            entity.quizId,
            entity.courseId,
            entity.quizName,
            entity.quizDescription,
            entity.createdAt
        );
    }
}

module.exports = QuizDTO;
