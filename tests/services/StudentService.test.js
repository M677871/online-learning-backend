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

    test('getAllStudents returns students', async () => {
        const students = [{ studentId: 1 }];
        StudentRepository.getAllStudents.mockResolvedValue(students);

        const result = await StudentService.getAllStudents();

        expect(result).toEqual(students);
    });

    test('getAllStudents wraps repository errors', async () => {
        StudentRepository.getAllStudents.mockRejectedValue(new Error('db down'));

        await expect(StudentService.getAllStudents()).rejects.toThrow('db down');
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

    test('getStudentById returns student when found', async () => {
        const student = { studentId: 33, userId: 8 };
        StudentRepository.getStudentById.mockResolvedValue(student);

        const result = await StudentService.getStudentById(33);

        expect(result).toEqual(student);
    });

    test('updateStudent throws not found when student does not exist', async () => {
        StudentRepository.studentExists.mockResolvedValue(false);

        await expect(
            StudentService.updateStudent(9, {
                userId: 8,
                stuFName: 'Jane',
                stuLName: 'Doe',
                dob: '2000-01-01',
                profilePicture: 'https://example.com/jane.png',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Student ID 9 not found',
        });
    });

    test('updateStudent throws not found when user does not exist', async () => {
        StudentRepository.studentExists.mockResolvedValue(true);
        UserRepository.userExistsById.mockResolvedValue(false);

        await expect(
            StudentService.updateStudent(9, {
                userId: 8,
                stuFName: 'Jane',
                stuLName: 'Doe',
                dob: '2000-01-01',
                profilePicture: 'https://example.com/jane.png',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'User ID 8 not found',
        });
    });

    test('updateStudent updates and returns student', async () => {
        const payload = {
            userId: 8,
            stuFName: 'Jane',
            stuLName: 'Doe',
            dob: '2000-01-01',
            profilePicture: 'https://example.com/jane.png',
        };

        StudentRepository.studentExists.mockResolvedValue(true);
        UserRepository.userExistsById.mockResolvedValue(true);
        StudentRepository.updateStudent.mockResolvedValue(1);
        StudentRepository.getStudentById.mockResolvedValue({ studentId: 9, ...payload });

        const result = await StudentService.updateStudent(9, payload);

        expect(StudentRepository.updateStudent).toHaveBeenCalledWith(9, payload);
        expect(result).toEqual({ studentId: 9, ...payload });
    });

    test('deleteStudent throws not found when student does not exist', async () => {
        StudentRepository.studentExists.mockResolvedValue(false);

        await expect(StudentService.deleteStudent(10)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Student ID 10 not found',
        });
    });

    test('deleteStudent deletes an existing student', async () => {
        StudentRepository.studentExists.mockResolvedValue(true);
        StudentRepository.deleteStudent.mockResolvedValue(1);

        await StudentService.deleteStudent(10);

        expect(StudentRepository.deleteStudent).toHaveBeenCalledWith(10);
    });

    test('getStudentCourses throws not found when student does not exist', async () => {
        StudentRepository.studentExists.mockResolvedValue(false);

        await expect(StudentService.getStudentCourses(10)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Student ID 10 not found',
        });
    });

    test('getStudentCourses returns student courses', async () => {
        const courses = [{ course_id: 1 }];
        StudentRepository.studentExists.mockResolvedValue(true);
        StudentRepository.getStudentCourses.mockResolvedValue(courses);

        const result = await StudentService.getStudentCourses(10);

        expect(result).toEqual(courses);
    });
});
