jest.mock('../../src/domain/repositories/QuizResultRepository', () => ({
    getAllQuizResults: jest.fn(),
    getQuizResultById: jest.fn(),
    createQuizResult: jest.fn(),
    updateQuizResult: jest.fn(),
    deleteQuizResult: jest.fn(),
    resultExists: jest.fn(),
    resultExistsByStudentAndQuiz: jest.fn(),
}));

jest.mock('../../src/domain/repositories/QuizRepository', () => ({
    quizExists: jest.fn(),
}));

jest.mock('../../src/domain/repositories/StudentRepository', () => ({
    studentExists: jest.fn(),
}));

const QuizResultService = require('../../src/services/QuizResultService');
const QuizResultRepository = require('../../src/domain/repositories/QuizResultRepository');
const QuizRepository = require('../../src/domain/repositories/QuizRepository');
const StudentRepository = require('../../src/domain/repositories/StudentRepository');

describe('QuizResultService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAllQuizResults returns results', async () => {
        const results = [{ resultId: 1 }];
        QuizResultRepository.getAllQuizResults.mockResolvedValue(results);

        const result = await QuizResultService.getAllQuizResults();

        expect(result).toEqual(results);
    });

    test('getAllQuizResults wraps repository errors', async () => {
        QuizResultRepository.getAllQuizResults.mockRejectedValue(new Error('db down'));

        await expect(QuizResultService.getAllQuizResults()).rejects.toThrow('db down');
    });

    test('getQuizResultById throws not found when result does not exist', async () => {
        QuizResultRepository.getQuizResultById.mockResolvedValue(null);

        await expect(QuizResultService.getQuizResultById(5)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Result ID 5 not found',
        });
    });

    test('getQuizResultById returns result when found', async () => {
        const row = { resultId: 5, quizId: 1, studentId: 2, score: 88 };
        QuizResultRepository.getQuizResultById.mockResolvedValue(row);

        const result = await QuizResultService.getQuizResultById(5);

        expect(result).toEqual(row);
    });

    test('createQuizResult throws not found when quiz does not exist', async () => {
        QuizRepository.quizExists.mockResolvedValue(false);

        await expect(
            QuizResultService.createQuizResult({
                quizId: 77,
                studentId: 3,
                score: 80,
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz ID 77 not found',
        });
    });

    test('createQuizResult throws not found when student does not exist', async () => {
        QuizRepository.quizExists.mockResolvedValue(true);
        StudentRepository.studentExists.mockResolvedValue(false);

        await expect(
            QuizResultService.createQuizResult({
                quizId: 3,
                studentId: 999,
                score: 80,
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Student ID 999 not found',
        });
    });

    test('createQuizResult throws conflict for duplicate student/quiz result', async () => {
        QuizRepository.quizExists.mockResolvedValue(true);
        StudentRepository.studentExists.mockResolvedValue(true);
        QuizResultRepository.resultExistsByStudentAndQuiz.mockResolvedValue(true);

        await expect(
            QuizResultService.createQuizResult({
                quizId: 3,
                studentId: 2,
                score: 90,
            })
        ).rejects.toMatchObject({
            statusCode: 409,
            message: 'Result already exists for this student and quiz',
        });
    });

    test('updateQuizResult throws not found when student does not exist', async () => {
        QuizResultRepository.resultExists.mockResolvedValue(true);
        QuizRepository.quizExists.mockResolvedValue(true);
        StudentRepository.studentExists.mockResolvedValue(false);

        await expect(
            QuizResultService.updateQuizResult(9, {
                quizId: 3,
                studentId: 999,
                score: 70,
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Student ID 999 not found',
        });
    });

    test('updateQuizResult throws not found when result does not exist', async () => {
        QuizResultRepository.resultExists.mockResolvedValue(false);

        await expect(
            QuizResultService.updateQuizResult(9, {
                quizId: 3,
                studentId: 2,
                score: 70,
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Result ID 9 not found',
        });
    });

    test('updateQuizResult throws not found when quiz does not exist', async () => {
        QuizResultRepository.resultExists.mockResolvedValue(true);
        QuizRepository.quizExists.mockResolvedValue(false);

        await expect(
            QuizResultService.updateQuizResult(9, {
                quizId: 333,
                studentId: 2,
                score: 70,
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz ID 333 not found',
        });
    });

    test('updateQuizResult updates and returns result', async () => {
        const payload = { quizId: 3, studentId: 2, score: 75 };

        QuizResultRepository.resultExists.mockResolvedValue(true);
        QuizRepository.quizExists.mockResolvedValue(true);
        StudentRepository.studentExists.mockResolvedValue(true);
        QuizResultRepository.updateQuizResult.mockResolvedValue(1);
        QuizResultRepository.getQuizResultById.mockResolvedValue({ resultId: 9, ...payload });

        const result = await QuizResultService.updateQuizResult(9, payload);

        expect(QuizResultRepository.updateQuizResult).toHaveBeenCalledWith(9, payload);
        expect(result).toEqual({ resultId: 9, ...payload });
    });

    test('createQuizResult persists and returns created result when valid', async () => {
        const payload = {
            quizId: 1,
            studentId: 2,
            score: 88,
        };

        QuizRepository.quizExists.mockResolvedValue(true);
        StudentRepository.studentExists.mockResolvedValue(true);
        QuizResultRepository.resultExistsByStudentAndQuiz.mockResolvedValue(false);
        QuizResultRepository.createQuizResult.mockResolvedValue(30);
        QuizResultRepository.getQuizResultById.mockResolvedValue({
            resultId: 30,
            ...payload,
        });

        const result = await QuizResultService.createQuizResult(payload);

        expect(QuizResultRepository.createQuizResult).toHaveBeenCalledWith(payload);
        expect(result).toEqual({
            resultId: 30,
            ...payload,
        });
    });

    test('deleteQuizResult throws not found when result does not exist', async () => {
        QuizResultRepository.resultExists.mockResolvedValue(false);

        await expect(QuizResultService.deleteQuizResult(1)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz Result ID 1 not found',
        });
    });

    test('deleteQuizResult deletes an existing result', async () => {
        QuizResultRepository.resultExists.mockResolvedValue(true);
        QuizResultRepository.deleteQuizResult.mockResolvedValue(1);

        await QuizResultService.deleteQuizResult(1);

        expect(QuizResultRepository.deleteQuizResult).toHaveBeenCalledWith(1);
    });
});
