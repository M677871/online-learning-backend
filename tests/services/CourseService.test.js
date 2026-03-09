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

    test('getAllCourses returns courses', async () => {
        const courses = [{ courseId: 1, courseName: 'Node.js Basics' }];
        CourseRepository.getAllCourses.mockResolvedValue(courses);

        const result = await CourseService.getAllCourses();

        expect(result).toEqual(courses);
    });

    test('getAllCourses wraps repository errors', async () => {
        CourseRepository.getAllCourses.mockRejectedValue(new Error('db down'));

        await expect(CourseService.getAllCourses()).rejects.toThrow('db down');
    });

    test('getCourseById throws not found when course is missing', async () => {
        CourseRepository.getCourseById.mockResolvedValue(null);

        await expect(CourseService.getCourseById(13)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 13 not found',
        });
    });

    test('getCourseById returns course when found', async () => {
        const course = { courseId: 13, courseName: 'Node.js Basics' };
        CourseRepository.getCourseById.mockResolvedValue(course);

        const result = await CourseService.getCourseById(13);

        expect(result).toEqual(course);
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

    test('updateCourse throws not found when instructor does not exist', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(true);
        InstructorRepository.instructorExists.mockResolvedValue(false);

        await expect(
            CourseService.updateCourse(100, {
                instructorId: 99,
                categorieId: 1,
                courseName: 'Advanced Node.js',
                description: 'updated',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Instructor ID 99 not found',
        });
    });

    test('updateCourse throws not found when category does not exist', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(true);
        InstructorRepository.instructorExists.mockResolvedValue(true);
        CategoryRepository.categoryExists.mockResolvedValue(false);

        await expect(
            CourseService.updateCourse(100, {
                instructorId: 2,
                categorieId: 55,
                courseName: 'Advanced Node.js',
                description: 'updated',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Category ID 55 not found',
        });
    });

    test('updateCourse updates and returns course', async () => {
        const payload = {
            instructorId: 2,
            categorieId: 1,
            courseName: 'Advanced Node.js',
            description: 'updated',
        };

        CourseRepository.courseExistsById.mockResolvedValue(true);
        InstructorRepository.instructorExists.mockResolvedValue(true);
        CategoryRepository.categoryExists.mockResolvedValue(true);
        CourseRepository.updateCourse.mockResolvedValue(1);
        CourseRepository.getCourseById.mockResolvedValue({ courseId: 100, ...payload });

        const result = await CourseService.updateCourse(100, payload);

        expect(CourseRepository.updateCourse).toHaveBeenCalledWith(100, payload);
        expect(result).toEqual({ courseId: 100, ...payload });
    });

    test('deleteCourse throws not found when course id does not exist', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(CourseService.deleteCourse(70)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 70 not found',
        });
    });

    test('deleteCourse deletes existing course', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(true);
        CourseRepository.deleteCourse.mockResolvedValue(1);

        await CourseService.deleteCourse(70);

        expect(CourseRepository.deleteCourse).toHaveBeenCalledWith(70);
    });

    test('getInstructorByCourseId throws not found when course id does not exist', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(CourseService.getInstructorByCourseId(7)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 7 not found',
        });
    });

    test('getInstructorByCourseId returns instructor details', async () => {
        const instructor = { instructor_id: 3 };
        CourseRepository.courseExistsById.mockResolvedValue(true);
        CourseRepository.getInstructorByCourseId.mockResolvedValue(instructor);

        const result = await CourseService.getInstructorByCourseId(7);

        expect(result).toEqual(instructor);
    });

    test('getStudentsOfCourse throws not found when course id does not exist', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(CourseService.getStudentsOfCourse(7)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 7 not found',
        });
    });

    test('getStudentsOfCourse returns enrolled students', async () => {
        const students = [{ student_id: 10 }];
        CourseRepository.courseExistsById.mockResolvedValue(true);
        CourseRepository.getStudentsOfCourse.mockResolvedValue(students);

        const result = await CourseService.getStudentsOfCourse(7);

        expect(result).toEqual(students);
    });
});
