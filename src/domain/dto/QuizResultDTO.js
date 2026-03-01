class QuizResultDTO {
    constructor(resultId, quizId, studentId, score, completedAt) {
        this.resultId = resultId;
        this.quizId = quizId;
        this.studentId = studentId;
        this.score = score;
        this.completedAt = completedAt;
    }

    static fromEntity(entity) {
        return new QuizResultDTO(
            entity.resultId,
            entity.quizId,
            entity.studentId,
            entity.score,
            entity.completedAt
        );
    }
}

module.exports = QuizResultDTO;
