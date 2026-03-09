const request = require('supertest');
const {
    instructorAuthHeader,
    studentAuthHeader,
    apiError,
    expectValidationError,
} = require('../helpers/routeTestUtils');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/InstructorService', () => ({
    getAllInstructors: jest.fn(),
    getInstructorById: jest.fn(),
    createInstructor: jest.fn(),
    updateInstructor: jest.fn(),
    deleteInstructor: jest.fn(),
    getInstructorCourses: jest.fn(),
}));

const InstructorService = require('../../src/services/InstructorService');
const app = require('../../src/app');

const validInstructorPayload = {
    userId: 2,
    insFName: 'John',
    insLName: 'Doe',
    bio: 'Experienced instructor',
    profilePicture: 'https://example.com/john.png',
};


beforeEach(() => {
    jest.clearAllMocks();
});

describe('Instructor routes – GET /api/instructors', () => {
    it('should return instructors', async () => {
        InstructorService.getAllInstructors.mockResolvedValue([
            { instructorId: 1, ...validInstructorPayload },
        ]);

        const res = await request(app).get('/api/instructors');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].instructorId).toBe(1);
        expect(InstructorService.getAllInstructors).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when service fails', async () => {
        InstructorService.getAllInstructors.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app).get('/api/instructors');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Instructor routes – GET /api/instructors/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/instructors/abc');
        expectValidationError(res);
        expect(InstructorService.getInstructorById).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        InstructorService.getInstructorById.mockRejectedValue(apiError(404, 'Instructor ID 20 not found'));

        const res = await request(app).get('/api/instructors/20');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Instructor ID 20 not found');
        expect(InstructorService.getInstructorById).toHaveBeenCalledWith('20');
    });

    it('should return instructor', async () => {
        InstructorService.getInstructorById.mockResolvedValue({
            instructorId: 2,
            ...validInstructorPayload,
        });

        const res = await request(app).get('/api/instructors/2');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            instructorId: 2,
            ...validInstructorPayload,
        });
        expect(InstructorService.getInstructorById).toHaveBeenCalledWith('2');
    });
});

describe('Instructor routes – GET /api/instructors/courses/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/instructors/courses/not-int');

        expectValidationError(res);
        expect(InstructorService.getInstructorCourses).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        InstructorService.getInstructorCourses.mockRejectedValue(apiError(404, 'Instructor ID 40 not found'));

        const res = await request(app).get('/api/instructors/courses/40');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Instructor ID 40 not found');
        expect(InstructorService.getInstructorCourses).toHaveBeenCalledWith('40');
    });

    it('should return instructor courses', async () => {
        InstructorService.getInstructorCourses.mockResolvedValue([{ course_id: 3 }]);

        const res = await request(app).get('/api/instructors/courses/2');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(InstructorService.getInstructorCourses).toHaveBeenCalledWith('2');
    });
});

describe('Instructor routes – POST /api/instructors', () => {
    it('should require authentication', async () => {
        const res = await request(app).post('/api/instructors').send(validInstructorPayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .post('/api/instructors')
            .set(studentAuthHeader())
            .send(validInstructorPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(InstructorService.createInstructor).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .post('/api/instructors')
            .set(instructorAuthHeader())
            .send({
                userId: 'invalid',
                insFName: '',
                insLName: '',
                bio: '',
                profilePicture: 'bad-url',
            });

        expectValidationError(res);
        expect(InstructorService.createInstructor).not.toHaveBeenCalled();
    });

    it('should handle conflict', async () => {
        InstructorService.createInstructor.mockRejectedValue(
            apiError(409, 'Instructor profile for user ID 2 already exists')
        );

        const res = await request(app)
            .post('/api/instructors')
            .set(instructorAuthHeader())
            .send(validInstructorPayload);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('Instructor profile for user ID 2 already exists');
        expect(InstructorService.createInstructor).toHaveBeenCalledWith(validInstructorPayload);
    });

    it('should create instructor', async () => {
        InstructorService.createInstructor.mockResolvedValue({
            instructorId: 8,
            ...validInstructorPayload,
        });

        const res = await request(app)
            .post('/api/instructors')
            .set(instructorAuthHeader())
            .send(validInstructorPayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Instructor created successfully');
        expect(InstructorService.createInstructor).toHaveBeenCalledWith(validInstructorPayload);
    });
});

describe('Instructor routes – PUT /api/instructors/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/instructors/2')
            .send(validInstructorPayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .put('/api/instructors/2')
            .set(studentAuthHeader())
            .send(validInstructorPayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(InstructorService.updateInstructor).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .put('/api/instructors/not-int')
            .set(instructorAuthHeader())
            .send(validInstructorPayload);

        expectValidationError(res);
        expect(InstructorService.updateInstructor).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .put('/api/instructors/2')
            .set(instructorAuthHeader())
            .send({
                userId: 'invalid',
                insFName: '',
                insLName: '',
                bio: '',
                profilePicture: 'bad-url',
            });

        expectValidationError(res);
        expect(InstructorService.updateInstructor).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        InstructorService.updateInstructor.mockRejectedValue(apiError(404, 'Instructor ID 9 not found'));

        const res = await request(app)
            .put('/api/instructors/9')
            .set(instructorAuthHeader())
            .send(validInstructorPayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Instructor ID 9 not found');
        expect(InstructorService.updateInstructor).toHaveBeenCalledWith('9', validInstructorPayload);
    });

    it('should update instructor', async () => {
        InstructorService.updateInstructor.mockResolvedValue({
            instructorId: 2,
            ...validInstructorPayload,
        });

        const res = await request(app)
            .put('/api/instructors/2')
            .set(instructorAuthHeader())
            .send(validInstructorPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Instructor updated successfully');
        expect(InstructorService.updateInstructor).toHaveBeenCalledWith('2', validInstructorPayload);
    });
});

describe('Instructor routes – DELETE /api/instructors/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/instructors/2');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/instructors/2')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(InstructorService.deleteInstructor).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/instructors/abc')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(InstructorService.deleteInstructor).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        InstructorService.deleteInstructor.mockRejectedValue(apiError(404, 'Instructor ID 2 not found'));

        const res = await request(app)
            .delete('/api/instructors/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Instructor ID 2 not found');
        expect(InstructorService.deleteInstructor).toHaveBeenCalledWith('2');
    });

    it('should delete instructor', async () => {
        InstructorService.deleteInstructor.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/instructors/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Instructor deleted successfully');
        expect(InstructorService.deleteInstructor).toHaveBeenCalledWith('2');
    });
});
