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

    test('deleteEnrollment throws not found when enrollment does not exist', async () => {
        EnrollmentRepository.enrollmentExists.mockResolvedValue(false);

        await expect(EnrollmentService.deleteEnrollment(66)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Enrollment ID 66 not found',
        });
    });
});
