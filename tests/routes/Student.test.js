const request = require('supertest');
const {
    authHeader,
    instructorAuthHeader,
    studentAuthHeader,
    apiError,
    expectValidationError,
} = require('../helpers/routeTestUtils');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/StudentService', () => ({
    getAllStudents: jest.fn(),
    getStudentById: jest.fn(),
    createStudent: jest.fn(),
    updateStudent: jest.fn(),
    deleteStudent: jest.fn(),
    getStudentCourses: jest.fn(),
}));

const StudentService = require('../../src/services/StudentService');
const app = require('../../src/app');

const validStudentPayload = {
    userId: 7,
    stuFName: 'Jane',
    stuLName: 'Doe',
    dob: '2000-01-01',
    profilePicture: 'https://example.com/jane.png',
};


beforeEach(() => {
    jest.clearAllMocks();
});

describe('Student routes – GET /api/students', () => {
    it('should require authentication', async () => {
        const res = await request(app).get('/api/students');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should return students', async () => {
        StudentService.getAllStudents.mockResolvedValue([
            { studentId: 1, ...validStudentPayload },
        ]);

        const res = await request(app)
            .get('/api/students')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].studentId).toBe(1);
        expect(StudentService.getAllStudents).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when service fails', async () => {
        StudentService.getAllStudents.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app)
            .get('/api/students')
            .set(authHeader());

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Student routes – GET /api/students/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).get('/api/students/2');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .get('/api/students/not-int')
            .set(authHeader());

        expectValidationError(res);
        expect(StudentService.getStudentById).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        StudentService.getStudentById.mockRejectedValue(apiError(404, 'Student ID 20 not found'));

        const res = await request(app)
            .get('/api/students/20')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Student ID 20 not found');
        expect(StudentService.getStudentById).toHaveBeenCalledWith('20');
    });

    it('should return student', async () => {
        StudentService.getStudentById.mockResolvedValue({
            studentId: 2,
            ...validStudentPayload,
        });

        const res = await request(app)
            .get('/api/students/2')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            studentId: 2,
            ...validStudentPayload,
        });
        expect(StudentService.getStudentById).toHaveBeenCalledWith('2');
    });
});

describe('Student routes – GET /api/students/studentCourses/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app)
            .get('/api/students/studentCourses/not-int')
            .set(authHeader());

        expectValidationError(res);
        expect(StudentService.getStudentCourses).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        StudentService.getStudentCourses.mockRejectedValue(apiError(404, 'Student ID 2 not found'));

        const res = await request(app)
            .get('/api/students/studentCourses/2')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Student ID 2 not found');
        expect(StudentService.getStudentCourses).toHaveBeenCalledWith('2');
    });

    it('should return student courses', async () => {
        StudentService.getStudentCourses.mockResolvedValue([{ course_id: 1, course_name: 'Node' }]);

        const res = await request(app)
            .get('/api/students/studentCourses/2')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(StudentService.getStudentCourses).toHaveBeenCalledWith('2');
    });
});

describe('Student routes – POST /api/students', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .post('/api/students')
            .send(validStudentPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .post('/api/students')
            .set(authHeader())
            .send({
                userId: 'invalid',
                stuFName: '',
                stuLName: '',
                dob: 'bad-date',
                profilePicture: 'not-url',
            });

        expectValidationError(res);
        expect(StudentService.createStudent).not.toHaveBeenCalled();
    });

    it('should handle conflict from service', async () => {
        StudentService.createStudent.mockRejectedValue(
            apiError(409, 'Student profile for user ID 7 already exists')
        );

        const res = await request(app)
            .post('/api/students')
            .set(authHeader())
            .send(validStudentPayload);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('Student profile for user ID 7 already exists');
        expect(StudentService.createStudent).toHaveBeenCalledWith(validStudentPayload);
    });

    it('should create student', async () => {
        StudentService.createStudent.mockResolvedValue({
            studentId: 10,
            ...validStudentPayload,
        });

        const res = await request(app)
            .post('/api/students')
            .set(authHeader())
            .send(validStudentPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Student created successfully');
        expect(StudentService.createStudent).toHaveBeenCalledWith(validStudentPayload);
    });
});

describe('Student routes – PUT /api/students/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/students/2')
            .send(validStudentPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should validate request data', async () => {
        const res = await request(app)
            .put('/api/students/not-int')
            .set(authHeader())
            .send(validStudentPayload);

        expectValidationError(res);
        expect(StudentService.updateStudent).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .put('/api/students/2')
            .set(authHeader())
            .send({
                userId: 'invalid',
                stuFName: '',
                stuLName: '',
                dob: 'bad-date',
                profilePicture: 'not-url',
            });

        expectValidationError(res);
        expect(StudentService.updateStudent).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        StudentService.updateStudent.mockRejectedValue(apiError(404, 'Student ID 40 not found'));

        const res = await request(app)
            .put('/api/students/40')
            .set(authHeader())
            .send(validStudentPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Student ID 40 not found');
        expect(StudentService.updateStudent).toHaveBeenCalledWith('40', validStudentPayload);
    });

    it('should update student', async () => {
        StudentService.updateStudent.mockResolvedValue({
            studentId: 2,
            ...validStudentPayload,
        });

        const res = await request(app)
            .put('/api/students/2')
            .set(authHeader())
            .send(validStudentPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Student updated successfully');
        expect(StudentService.updateStudent).toHaveBeenCalledWith('2', validStudentPayload);
    });
});

describe('Student routes – DELETE /api/students/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/students/2');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/students/2')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(StudentService.deleteStudent).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/students/not-int')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(StudentService.deleteStudent).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        StudentService.deleteStudent.mockRejectedValue(apiError(404, 'Student ID 2 not found'));

        const res = await request(app)
            .delete('/api/students/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Student ID 2 not found');
        expect(StudentService.deleteStudent).toHaveBeenCalledWith('2');
    });

    it('should delete student', async () => {
        StudentService.deleteStudent.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/students/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Student deleted successfully');
        expect(StudentService.deleteStudent).toHaveBeenCalledWith('2');
    });
});
