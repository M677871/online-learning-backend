class QuizAnswerDTO {
    constructor(answerId, questionId, answerText, answerType, isCorrect) {
        this.answerId = answerId;
        this.questionId = questionId;
        this.answerText = answerText;
        this.answerType = answerType;
        this.isCorrect = isCorrect;
    }

    static fromEntity(entity) {
        return new QuizAnswerDTO(
            entity.answerId,
            entity.questionId,
            entity.answerText,
            entity.answerType,
            entity.isCorrect
        );
    }
}

module.exports = QuizAnswerDTO;
