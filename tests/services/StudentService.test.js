jest.mock('../../src/domain/repositories/StudentRepository', () => ({
    getAllStudents: jest.fn(),
    getStudentById: jest.fn(),
    createStudent: jest.fn(),
    updateStudent: jest.fn(),
    deleteStudent: jest.fn(),
    studentExists: jest.fn(),
    studentExistsByUserId: jest.fn(),
    getStudentCourses: jest.fn(),
}));

jest.mock('../../src/domain/repositories/UserRepository', () => ({
    userExistsById: jest.fn(),
    getUserById: jest.fn(),
}));

const StudentService = require('../../src/services/StudentService');
const StudentRepository = require('../../src/domain/repositories/StudentRepository');
const UserRepository = require('../../src/domain/repositories/UserRepository');

describe('StudentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createStudent throws not found when user does not exist', async () => {
        UserRepository.userExistsById.mockResolvedValue(false);

        await expect(
            StudentService.createStudent({
                userId: 99,
                stuFName: 'Jane',
                stuLName: 'Doe',
                dob: '2000-01-01',
                profilePicture: 'https://example.com/jane.png',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'User ID 99 not found',
        });
    });

    test('createStudent throws conflict when student profile already exists', async () => {
        UserRepository.userExistsById.mockResolvedValue(true);
        StudentRepository.studentExistsByUserId.mockResolvedValue(true);

        await expect(
            StudentService.createStudent({
                userId: 5,
                stuFName: 'Jane',
                stuLName: 'Doe',
                dob: '2000-01-01',
                profilePicture: 'https://example.com/jane.png',
            })
        ).rejects.toMatchObject({
            statusCode: 409,
            message: 'Student profile for user ID 5 already exists',
        });
    });

    test('createStudent throws bad request when user type is not student', async () => {
        UserRepository.userExistsById.mockResolvedValue(true);
        StudentRepository.studentExistsByUserId.mockResolvedValue(false);
        UserRepository.getUserById.mockResolvedValue({
            userId: 5,
            email: 'teacher@example.com',
            userType: 'instructor',
        });

        await expect(
            StudentService.createStudent({
                userId: 5,
                stuFName: 'Jane',
                stuLName: 'Doe',
                dob: '2000-01-01',
                profilePicture: 'https://example.com/jane.png',
            })
        ).rejects.toMatchObject({
            statusCode: 400,
            message: 'User is not a student type',
        });
    });

    test('createStudent creates and returns student profile', async () => {
        const payload = {
            userId: 8,
            stuFName: 'Jane',
            stuLName: 'Doe',
            dob: '2000-01-01',
            profilePicture: 'https://example.com/jane.png',
        };

        UserRepository.userExistsById.mockResolvedValue(true);
        StudentRepository.studentExistsByUserId.mockResolvedValue(false);
        UserRepository.getUserById.mockResolvedValue({
            userId: 8,
            email: 'student@example.com',
            userType: 'student',
        });
        StudentRepository.createStudent.mockResolvedValue(14);
        StudentRepository.getStudentById.mockResolvedValue({
            studentId: 14,
            ...payload,
        });

        const result = await StudentService.createStudent(payload);

        expect(StudentRepository.createStudent).toHaveBeenCalledWith(payload);
        expect(result).toEqual({
            studentId: 14,
            ...payload,
        });
    });

    test('getStudentById throws not found when student does not exist', async () => {
        StudentRepository.getStudentById.mockResolvedValue(null);

        await expect(StudentService.getStudentById(33)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Student ID 33 not found',
        });
    });
});
