class QuizResult {
    constructor(resultId, quizId, studentId, score, completedAt) {
        this.resultId = resultId;
        this.quizId = quizId;
        this.studentId = studentId;
        this.score = score;
        this.completedAt = completedAt;
    }

    static fromRow(row) {
        return new QuizResult(
            row.result_id,
            row.quiz_id,
            row.student_id,
            row.score,
            row.completed_at
        );
    }
}

module.exports = QuizResult;
