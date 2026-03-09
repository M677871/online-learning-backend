jest.mock('../../src/domain/repositories/QuizQuestionRepository', () => ({
    getAllQuizQuestions: jest.fn(),
    getQuizQuestionById: jest.fn(),
    createQuizQuestion: jest.fn(),
    updateQuizQuestion: jest.fn(),
    deleteQuizQuestion: jest.fn(),
    questionExists: jest.fn(),
}));

jest.mock('../../src/domain/repositories/QuizRepository', () => ({
    quizExists: jest.fn(),
}));

const QuizQuestionService = require('../../src/services/QuizQuestionService');
const QuizQuestionRepository = require('../../src/domain/repositories/QuizQuestionRepository');
const QuizRepository = require('../../src/domain/repositories/QuizRepository');

describe('QuizQuestionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all quiz questions', async () => {
        const questions = [{ questionId: 1 }];
        QuizQuestionRepository.getAllQuizQuestions.mockResolvedValue(questions);

        const result = await QuizQuestionService.getAllQuizQuestions();

        expect(result).toEqual(questions);
    });

    it('should wrap getAllQuizQuestions repository errors', async () => {
        QuizQuestionRepository.getAllQuizQuestions.mockRejectedValue(new Error('db down'));

        await expect(QuizQuestionService.getAllQuizQuestions()).rejects.toThrow('db down');
    });

    it('should return 404 when question by id is not found', async () => {
        QuizQuestionRepository.getQuizQuestionById.mockResolvedValue(null);

        await expect(QuizQuestionService.getQuizQuestionById(4)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Question ID 4 not found',
        });
    });

    it('should return question by id when found', async () => {
        const question = { questionId: 4, quizId: 1 };
        QuizQuestionRepository.getQuizQuestionById.mockResolvedValue(question);

        const result = await QuizQuestionService.getQuizQuestionById(4);

        expect(result).toEqual(question);
    });

    it('should return 404 when creating question for missing quiz', async () => {
        QuizRepository.quizExists.mockResolvedValue(false);

        await expect(
            QuizQuestionService.createQuizQuestion({
                quizId: 22,
                questionText: 'What is HTTP?',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz ID 22 not found',
        });
    });

    it('should create and return question', async () => {
        const payload = { quizId: 2, questionText: 'What is HTTP?' };
        const created = { questionId: 6, ...payload };

        QuizRepository.quizExists.mockResolvedValue(true);
        QuizQuestionRepository.createQuizQuestion.mockResolvedValue(6);
        QuizQuestionRepository.getQuizQuestionById.mockResolvedValue(created);

        const result = await QuizQuestionService.createQuizQuestion(payload);

        expect(QuizQuestionRepository.createQuizQuestion).toHaveBeenCalledWith(payload);
        expect(result).toEqual(created);
    });

    it('should return 404 when updating missing question', async () => {
        QuizQuestionRepository.questionExists.mockResolvedValue(false);

        await expect(
            QuizQuestionService.updateQuizQuestion(5, { quizId: 2, questionText: 'Updated' })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Question ID 5 not found',
        });
    });

    it('should update and return question', async () => {
        const payload = { quizId: 2, questionText: 'Updated' };
        const updated = { questionId: 5, ...payload };

        QuizQuestionRepository.questionExists.mockResolvedValue(true);
        QuizQuestionRepository.updateQuizQuestion.mockResolvedValue(1);
        QuizQuestionRepository.getQuizQuestionById.mockResolvedValue(updated);

        const result = await QuizQuestionService.updateQuizQuestion(5, payload);

        expect(QuizQuestionRepository.updateQuizQuestion).toHaveBeenCalledWith(5, payload);
        expect(result).toEqual(updated);
    });

    it('should return 404 when deleting missing question', async () => {
        QuizQuestionRepository.questionExists.mockResolvedValue(false);

        await expect(QuizQuestionService.deleteQuizQuestion(5)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Question ID 5 not found',
        });
    });

    it('should delete question when it exists', async () => {
        QuizQuestionRepository.questionExists.mockResolvedValue(true);

        await QuizQuestionService.deleteQuizQuestion(5);

        expect(QuizQuestionRepository.deleteQuizQuestion).toHaveBeenCalledWith(5);
    });
});
