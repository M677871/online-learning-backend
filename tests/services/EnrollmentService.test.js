jest.mock('../../src/domain/repositories/EnrollmentRepository', () => ({
    getAllEnrollments: jest.fn(),
    getEnrollmentById: jest.fn(),
    createEnrollment: jest.fn(),
    updateEnrollment: jest.fn(),
    deleteEnrollment: jest.fn(),
    enrollmentExists: jest.fn(),
    enrollmentExistsByStudentAndCourse: jest.fn(),
}));

jest.mock('../../src/domain/repositories/StudentRepository', () => ({
    studentExists: jest.fn(),
}));

jest.mock('../../src/domain/repositories/CourseRepository', () => ({
    courseExistsById: jest.fn(),
}));

const EnrollmentService = require('../../src/services/EnrollmentService');
const EnrollmentRepository = require('../../src/domain/repositories/EnrollmentRepository');
const StudentRepository = require('../../src/domain/repositories/StudentRepository');
const CourseRepository = require('../../src/domain/repositories/CourseRepository');

describe('EnrollmentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAllEnrollments returns enrollments', async () => {
        const enrollments = [{ enrollmentId: 1 }];
        EnrollmentRepository.getAllEnrollments.mockResolvedValue(enrollments);

        const result = await EnrollmentService.getAllEnrollments();

        expect(result).toEqual(enrollments);
    });

    test('getAllEnrollments wraps repository errors', async () => {
        EnrollmentRepository.getAllEnrollments.mockRejectedValue(new Error('db down'));

        await expect(EnrollmentService.getAllEnrollments()).rejects.toThrow('db down');
    });

    test('getEnrollmentById throws not found when enrollment does not exist', async () => {
        EnrollmentRepository.getEnrollmentById.mockResolvedValue(null);

        await expect(EnrollmentService.getEnrollmentById(20)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Enrollment ID 20 not found',
        });
    });

    test('getEnrollmentById returns enrollment when found', async () => {
        const enrollment = { enrollmentId: 20, studentId: 1, courseId: 2 };
        EnrollmentRepository.getEnrollmentById.mockResolvedValue(enrollment);

        const result = await EnrollmentService.getEnrollmentById(20);

        expect(result).toEqual(enrollment);
    });

    test('createEnrollment throws not found when student does not exist', async () => {
        StudentRepository.studentExists.mockResolvedValue(false);

        await expect(
            EnrollmentService.createEnrollment({
                studentId: 9,
                courseId: 2,
                status: 'enrolled',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Student ID 9 not found',
        });
    });

    test('createEnrollment throws not found when course does not exist', async () => {
        StudentRepository.studentExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(
            EnrollmentService.createEnrollment({
                studentId: 1,
                courseId: 44,
                status: 'enrolled',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 44 not found',
        });
    });

    test('createEnrollment throws conflict when student is already enrolled', async () => {
        StudentRepository.studentExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(true);
        EnrollmentRepository.enrollmentExistsByStudentAndCourse.mockResolvedValue(true);

        await expect(
            EnrollmentService.createEnrollment({
                studentId: 1,
                courseId: 2,
                status: 'enrolled',
            })
        ).rejects.toMatchObject({
            statusCode: 409,
            message: 'Student is already enrolled in this course',
        });
    });

    test('createEnrollment persists and returns enrollment when valid', async () => {
        const payload = {
            studentId: 1,
            courseId: 2,
            status: 'enrolled',
        };

        StudentRepository.studentExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(true);
        EnrollmentRepository.enrollmentExistsByStudentAndCourse.mockResolvedValue(false);
        EnrollmentRepository.createEnrollment.mockResolvedValue(15);
        EnrollmentRepository.getEnrollmentById.mockResolvedValue({
            enrollmentId: 15,
            ...payload,
        });

        const result = await EnrollmentService.createEnrollment(payload);

        expect(EnrollmentRepository.createEnrollment).toHaveBeenCalledWith(payload);
        expect(result).toEqual({
            enrollmentId: 15,
            ...payload,
        });
    });

    test('updateEnrollment throws not found when enrollment does not exist', async () => {
        EnrollmentRepository.enrollmentExists.mockResolvedValue(false);

        await expect(
            EnrollmentService.updateEnrollment(999, {
                studentId: 1,
                courseId: 2,
                status: 'completed',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Enrollment ID 999 not found',
        });
    });

    test('updateEnrollment throws not found when student does not exist', async () => {
        EnrollmentRepository.enrollmentExists.mockResolvedValue(true);
        StudentRepository.studentExists.mockResolvedValue(false);

        await expect(
            EnrollmentService.updateEnrollment(999, {
                studentId: 11,
                courseId: 2,
                status: 'completed',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Student ID 11 not found',
        });
    });

    test('updateEnrollment throws not found when course does not exist', async () => {
        EnrollmentRepository.enrollmentExists.mockResolvedValue(true);
        StudentRepository.studentExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(
            EnrollmentService.updateEnrollment(999, {
                studentId: 1,
                courseId: 88,
                status: 'completed',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 88 not found',
        });
    });

    test('updateEnrollment updates and returns enrollment', async () => {
        const payload = {
            studentId: 1,
            courseId: 2,
            status: 'completed',
        };

        EnrollmentRepository.enrollmentExists.mockResolvedValue(true);
        StudentRepository.studentExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(true);
        EnrollmentRepository.updateEnrollment.mockResolvedValue(1);
        EnrollmentRepository.getEnrollmentById.mockResolvedValue({ enrollmentId: 3, ...payload });

        const result = await EnrollmentService.updateEnrollment(3, payload);

        expect(EnrollmentRepository.updateEnrollment).toHaveBeenCalledWith(3, payload);
        expect(result).toEqual({ enrollmentId: 3, ...payload });
    });

    test('deleteEnrollment throws not found when enrollment does not exist', async () => {
        EnrollmentRepository.enrollmentExists.mockResolvedValue(false);

        await expect(EnrollmentService.deleteEnrollment(66)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Enrollment ID 66 not found',
        });
    });

    test('deleteEnrollment deletes existing enrollment', async () => {
        EnrollmentRepository.enrollmentExists.mockResolvedValue(true);
        EnrollmentRepository.deleteEnrollment.mockResolvedValue(1);

        await EnrollmentService.deleteEnrollment(66);

        expect(EnrollmentRepository.deleteEnrollment).toHaveBeenCalledWith(66);
    });
});
