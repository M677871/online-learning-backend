jest.mock('../../src/domain/repositories/QuizAnswerRepository', () => ({
    getAllQuizAnswers: jest.fn(),
    getQuizAnswerById: jest.fn(),
    createQuizAnswer: jest.fn(),
    updateQuizAnswer: jest.fn(),
    deleteQuizAnswer: jest.fn(),
    answerExists: jest.fn(),
}));

jest.mock('../../src/domain/repositories/QuizQuestionRepository', () => ({
    questionExists: jest.fn(),
}));

const QuizAnswerService = require('../../src/services/QuizAnswerService');
const QuizAnswerRepository = require('../../src/domain/repositories/QuizAnswerRepository');
const QuizQuestionRepository = require('../../src/domain/repositories/QuizQuestionRepository');

describe('QuizAnswerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all quiz answers', async () => {
        const answers = [{ answerId: 1 }];
        QuizAnswerRepository.getAllQuizAnswers.mockResolvedValue(answers);

        const result = await QuizAnswerService.getAllQuizAnswers();

        expect(result).toEqual(answers);
    });

    it('should wrap getAllQuizAnswers repository errors', async () => {
        QuizAnswerRepository.getAllQuizAnswers.mockRejectedValue(new Error('db down'));

        await expect(QuizAnswerService.getAllQuizAnswers()).rejects.toThrow('db down');
    });

    it('should return 404 when answer by id is not found', async () => {
        QuizAnswerRepository.getQuizAnswerById.mockResolvedValue(null);

        await expect(QuizAnswerService.getQuizAnswerById(3)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Answer ID 3 not found',
        });
    });

    it('should return answer by id when found', async () => {
        const answer = { answerId: 3, questionId: 2 };
        QuizAnswerRepository.getQuizAnswerById.mockResolvedValue(answer);

        const result = await QuizAnswerService.getQuizAnswerById(3);

        expect(result).toEqual(answer);
    });

    it('should return 404 when creating answer for missing question', async () => {
        QuizQuestionRepository.questionExists.mockResolvedValue(false);

        await expect(
            QuizAnswerService.createQuizAnswer({
                questionId: 77,
                answerText: 'A',
                answerType: 'multiple choice',
                isCorrect: true,
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Question ID 77 not found',
        });
    });

    it('should create and return answer', async () => {
        const payload = {
            questionId: 2,
            answerText: 'A',
            answerType: 'multiple choice',
            isCorrect: true,
        };
        const created = { answerId: 8, ...payload };

        QuizQuestionRepository.questionExists.mockResolvedValue(true);
        QuizAnswerRepository.createQuizAnswer.mockResolvedValue(8);
        QuizAnswerRepository.getQuizAnswerById.mockResolvedValue(created);

        const result = await QuizAnswerService.createQuizAnswer(payload);

        expect(QuizAnswerRepository.createQuizAnswer).toHaveBeenCalledWith(payload);
        expect(result).toEqual(created);
    });

    it('should return 404 when updating missing answer', async () => {
        QuizAnswerRepository.answerExists.mockResolvedValue(false);

        await expect(
            QuizAnswerService.updateQuizAnswer(4, {
                questionId: 2,
                answerText: 'Updated',
                answerType: 'multiple choice',
                isCorrect: false,
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Answer ID 4 not found',
        });
    });

    it('should update and return answer', async () => {
        const payload = {
            questionId: 2,
            answerText: 'Updated',
            answerType: 'multiple choice',
            isCorrect: false,
        };
        const updated = { answerId: 4, ...payload };

        QuizAnswerRepository.answerExists.mockResolvedValue(true);
        QuizAnswerRepository.updateQuizAnswer.mockResolvedValue(1);
        QuizAnswerRepository.getQuizAnswerById.mockResolvedValue(updated);

        const result = await QuizAnswerService.updateQuizAnswer(4, payload);

        expect(QuizAnswerRepository.updateQuizAnswer).toHaveBeenCalledWith(4, payload);
        expect(result).toEqual(updated);
    });

    it('should return 404 when deleting missing answer', async () => {
        QuizAnswerRepository.answerExists.mockResolvedValue(false);

        await expect(QuizAnswerService.deleteQuizAnswer(4)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Answer ID 4 not found',
        });
    });

    it('should delete answer when it exists', async () => {
        QuizAnswerRepository.answerExists.mockResolvedValue(true);

        await QuizAnswerService.deleteQuizAnswer(4);

        expect(QuizAnswerRepository.deleteQuizAnswer).toHaveBeenCalledWith(4);
    });
});
