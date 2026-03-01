class QuizQuestion {
    constructor(questionId, quizId, questionText, createdAt) {
        this.questionId = questionId;
        this.quizId = quizId;
        this.questionText = questionText;
        this.createdAt = createdAt;
    }

    static fromRow(row) {
        return new QuizQuestion(
            row.question_id,
            row.quiz_id,
            row.question_text,
            row.created_at
        );
    }
}

module.exports = QuizQuestion;
