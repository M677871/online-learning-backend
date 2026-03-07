jest.mock('../../src/domain/repositories/CourseRepository', () => ({
    getAllCourses: jest.fn(),
    getCourseById: jest.fn(),
    createCourse: jest.fn(),
    updateCourse: jest.fn(),
    deleteCourse: jest.fn(),
    courseExistsById: jest.fn(),
    getInstructorByCourseId: jest.fn(),
    getStudentsOfCourse: jest.fn(),
}));

jest.mock('../../src/domain/repositories/InstructorRepository', () => ({
    instructorExists: jest.fn(),
}));

jest.mock('../../src/domain/repositories/CategoryRepository', () => ({
    categoryExists: jest.fn(),
}));

const CourseService = require('../../src/services/CourseService');
const CourseRepository = require('../../src/domain/repositories/CourseRepository');
const InstructorRepository = require('../../src/domain/repositories/InstructorRepository');
const CategoryRepository = require('../../src/domain/repositories/CategoryRepository');

describe('CourseService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createCourse throws not found when instructor does not exist', async () => {
        InstructorRepository.instructorExists.mockResolvedValue(false);

        await expect(
            CourseService.createCourse({
                instructorId: 99,
                categorieId: 1,
                courseName: 'Node.js Basics',
                description: 'intro',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Instructor ID 99 not found',
        });
    });

    test('createCourse throws not found when category does not exist', async () => {
        InstructorRepository.instructorExists.mockResolvedValue(true);
        CategoryRepository.categoryExists.mockResolvedValue(false);

        await expect(
            CourseService.createCourse({
                instructorId: 2,
                categorieId: 77,
                courseName: 'Node.js Basics',
                description: 'intro',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Category ID 77 not found',
        });
    });

    test('createCourse creates and returns course when dependencies exist', async () => {
        const payload = {
            instructorId: 2,
            categorieId: 1,
            courseName: 'Node.js Basics',
            description: 'intro',
        };

        InstructorRepository.instructorExists.mockResolvedValue(true);
        CategoryRepository.categoryExists.mockResolvedValue(true);
        CourseRepository.createCourse.mockResolvedValue(12);
        CourseRepository.getCourseById.mockResolvedValue({
            courseId: 12,
            ...payload,
        });

        const result = await CourseService.createCourse(payload);

        expect(CourseRepository.createCourse).toHaveBeenCalledWith(payload);
        expect(result).toEqual({
            courseId: 12,
            ...payload,
        });
    });

    test('updateCourse throws not found when course id does not exist', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(
            CourseService.updateCourse(100, {
                instructorId: 2,
                categorieId: 1,
                courseName: 'Advanced Node.js',
                description: 'updated',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 100 not found',
        });
    });

    test('deleteCourse throws not found when course id does not exist', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(CourseService.deleteCourse(70)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 70 not found',
        });
    });
});
