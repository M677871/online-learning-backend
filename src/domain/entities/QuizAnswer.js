class QuizAnswer {
    constructor(answerId, questionId, answerText, answerType, isCorrect) {
        this.answerId = answerId;
        this.questionId = questionId;
        this.answerText = answerText;
        this.answerType = answerType;
        this.isCorrect = isCorrect;
    }

    static fromRow(row) {
        return new QuizAnswer(
            row.answer_id,
            row.question_id,
            row.answer_text,
            row.answer_type,
            row.is_correct
        );
    }
}

module.exports = QuizAnswer;
