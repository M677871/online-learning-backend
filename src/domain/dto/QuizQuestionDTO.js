class QuizQuestionDTO {
    constructor(questionId, quizId, questionText, createdAt) {
        this.questionId = questionId;
        this.quizId = quizId;
        this.questionText = questionText;
        this.createdAt = createdAt;
    }

    static fromEntity(entity) {
        return new QuizQuestionDTO(
            entity.questionId,
            entity.quizId,
            entity.questionText,
            entity.createdAt
        );
    }
}

module.exports = QuizQuestionDTO;
