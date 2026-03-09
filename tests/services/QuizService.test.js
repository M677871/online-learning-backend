jest.mock('../../src/domain/repositories/QuizRepository', () => ({
    getAllQuizzes: jest.fn(),
    getQuizById: jest.fn(),
    createQuiz: jest.fn(),
    updateQuiz: jest.fn(),
    deleteQuiz: jest.fn(),
    quizExists: jest.fn(),
}));

jest.mock('../../src/domain/repositories/CourseRepository', () => ({
    courseExistsById: jest.fn(),
}));

const QuizService = require('../../src/services/QuizService');
const QuizRepository = require('../../src/domain/repositories/QuizRepository');
const CourseRepository = require('../../src/domain/repositories/CourseRepository');

describe('QuizService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all quizzes', async () => {
        const quizzes = [{ quizId: 1 }];
        QuizRepository.getAllQuizzes.mockResolvedValue(quizzes);

        const result = await QuizService.getAllQuizzes();

        expect(result).toEqual(quizzes);
    });

    it('should wrap getAllQuizzes repository errors', async () => {
        QuizRepository.getAllQuizzes.mockRejectedValue(new Error('db down'));

        await expect(QuizService.getAllQuizzes()).rejects.toThrow('db down');
    });

    it('should return 404 when quiz by id is not found', async () => {
        QuizRepository.getQuizById.mockResolvedValue(null);

        await expect(QuizService.getQuizById(20)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz ID 20 not found',
        });
    });

    it('should return quiz by id when found', async () => {
        const quiz = { quizId: 20, courseId: 3 };
        QuizRepository.getQuizById.mockResolvedValue(quiz);

        const result = await QuizService.getQuizById(20);

        expect(result).toEqual(quiz);
    });

    it('should return 404 when creating quiz for missing course', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(
            QuizService.createQuiz({
                courseId: 70,
                quizName: 'Week 1',
                quizDescription: 'Basics',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 70 not found',
        });
    });

    it('should create and return quiz', async () => {
        const payload = {
            courseId: 3,
            quizName: 'Week 1',
            quizDescription: 'Basics',
        };
        const created = { quizId: 5, ...payload };

        CourseRepository.courseExistsById.mockResolvedValue(true);
        QuizRepository.createQuiz.mockResolvedValue(5);
        QuizRepository.getQuizById.mockResolvedValue(created);

        const result = await QuizService.createQuiz(payload);

        expect(QuizRepository.createQuiz).toHaveBeenCalledWith(payload);
        expect(result).toEqual(created);
    });

    it('should return 404 when updating missing quiz', async () => {
        QuizRepository.quizExists.mockResolvedValue(false);

        await expect(
            QuizService.updateQuiz(9, {
                courseId: 3,
                quizName: 'Updated',
                quizDescription: 'New',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz ID 9 not found',
        });
    });

    it('should return 404 when updating quiz with missing course', async () => {
        QuizRepository.quizExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(
            QuizService.updateQuiz(9, {
                courseId: 99,
                quizName: 'Updated',
                quizDescription: 'New',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 99 not found',
        });
    });

    it('should update and return quiz', async () => {
        const payload = {
            courseId: 3,
            quizName: 'Updated',
            quizDescription: 'New',
        };
        const updated = { quizId: 9, ...payload };

        QuizRepository.quizExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(true);
        QuizRepository.updateQuiz.mockResolvedValue(1);
        QuizRepository.getQuizById.mockResolvedValue(updated);

        const result = await QuizService.updateQuiz(9, payload);

        expect(QuizRepository.updateQuiz).toHaveBeenCalledWith(9, payload);
        expect(result).toEqual(updated);
    });

    it('should return 404 when deleting missing quiz', async () => {
        QuizRepository.quizExists.mockResolvedValue(false);

        await expect(QuizService.deleteQuiz(2)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Quiz ID 2 not found',
        });
    });

    it('should delete quiz when it exists', async () => {
        QuizRepository.quizExists.mockResolvedValue(true);

        await QuizService.deleteQuiz(2);

        expect(QuizRepository.deleteQuiz).toHaveBeenCalledWith(2);
    });
});
