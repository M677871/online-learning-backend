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

jest.mock('../../src/services/CourseService', () => ({
    getAllCourses: jest.fn(),
    getCourseById: jest.fn(),
    createCourse: jest.fn(),
    updateCourse: jest.fn(),
    deleteCourse: jest.fn(),
    getInstructorByCourseId: jest.fn(),
    getStudentsOfCourse: jest.fn(),
}));

const CourseService = require('../../src/services/CourseService');
const app = require('../../src/app');

const validCoursePayload = {
    instructorId: 2,
    categorieId: 1,
    courseName: 'Node Fundamentals',
    description: 'Backend basics',
};


beforeEach(() => {
    jest.clearAllMocks();
});

describe('Course routes – GET /api/courses', () => {
    it('should return courses', async () => {
        CourseService.getAllCourses.mockResolvedValue([
            { courseId: 1, ...validCoursePayload, createdAt: '2025-01-01' },
        ]);

        const res = await request(app).get('/api/courses');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].courseName).toBe('Node Fundamentals');
        expect(CourseService.getAllCourses).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when service fails', async () => {
        CourseService.getAllCourses.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app).get('/api/courses');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('Course routes – GET /api/courses/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/courses/not-int');
        expectValidationError(res);
        expect(CourseService.getCourseById).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CourseService.getCourseById.mockRejectedValue(apiError(404, 'Course ID 99 not found'));

        const res = await request(app).get('/api/courses/99');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 99 not found');
        expect(CourseService.getCourseById).toHaveBeenCalledWith('99');
    });

    it('should return a course', async () => {
        CourseService.getCourseById.mockResolvedValue({
            courseId: 1,
            ...validCoursePayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app).get('/api/courses/1');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            courseId: 1,
            ...validCoursePayload,
            createdAt: '2025-01-01',
        });
        expect(CourseService.getCourseById).toHaveBeenCalledWith('1');
    });
});

describe('Course routes – GET /api/courses/instructorByCourseId/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/courses/instructorByCourseId/not-int');

        expectValidationError(res);
        expect(CourseService.getInstructorByCourseId).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CourseService.getInstructorByCourseId.mockRejectedValue(apiError(404, 'Course ID 101 not found'));

        const res = await request(app).get('/api/courses/instructorByCourseId/101');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 101 not found');
        expect(CourseService.getInstructorByCourseId).toHaveBeenCalledWith('101');
    });

    it('should return instructor', async () => {
        CourseService.getInstructorByCourseId.mockResolvedValue({
            instructor_id: 2,
            ins_FName: 'John',
            ins_LName: 'Doe',
        });

        const res = await request(app).get('/api/courses/instructorByCourseId/1');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.instructor_id).toBe(2);
        expect(CourseService.getInstructorByCourseId).toHaveBeenCalledWith('1');
    });
});

describe('Course routes – GET /api/courses/stdOfCourse/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app).get('/api/courses/stdOfCourse/abc');

        expectValidationError(res);
        expect(CourseService.getStudentsOfCourse).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CourseService.getStudentsOfCourse.mockRejectedValue(apiError(404, 'Course ID 404 not found'));

        const res = await request(app).get('/api/courses/stdOfCourse/404');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 404 not found');
        expect(CourseService.getStudentsOfCourse).toHaveBeenCalledWith('404');
    });

    it('should return course students', async () => {
        CourseService.getStudentsOfCourse.mockResolvedValue([
            { studend_id: 5, stu_FName: 'Jane' },
        ]);

        const res = await request(app).get('/api/courses/stdOfCourse/1');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(CourseService.getStudentsOfCourse).toHaveBeenCalledWith('1');
    });
});

describe('Course routes – POST /api/courses', () => {
    it('should require authentication', async () => {
        const res = await request(app).post('/api/courses').send(validCoursePayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .post('/api/courses')
            .set(studentAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseService.createCourse).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .post('/api/courses')
            .set(instructorAuthHeader())
            .send({
                instructorId: 'bad',
                categorieId: 1,
                courseName: '',
                description: '',
            });

        expectValidationError(res);
        expect(CourseService.createCourse).not.toHaveBeenCalled();
    });

    it('should return service not found errors', async () => {
        CourseService.createCourse.mockRejectedValue(apiError(404, 'Instructor ID 999 not found'));

        const res = await request(app)
            .post('/api/courses')
            .set(instructorAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Instructor ID 999 not found');
        expect(CourseService.createCourse).toHaveBeenCalledWith(validCoursePayload);
    });

    it('should create course', async () => {
        CourseService.createCourse.mockResolvedValue({
            courseId: 10,
            ...validCoursePayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .post('/api/courses')
            .set(instructorAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Course created successfully');
        expect(res.body.data.courseId).toBe(10);
        expect(CourseService.createCourse).toHaveBeenCalledWith(validCoursePayload);
    });
});

describe('Course routes – PUT /api/courses/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/courses/2')
            .send(validCoursePayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .put('/api/courses/2')
            .set(studentAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseService.updateCourse).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .put('/api/courses/not-int')
            .set(instructorAuthHeader())
            .send(validCoursePayload);

        expectValidationError(res);
        expect(CourseService.updateCourse).not.toHaveBeenCalled();
    });

    it('should validate payload', async () => {
        const res = await request(app)
            .put('/api/courses/2')
            .set(instructorAuthHeader())
            .send({
                instructorId: 'bad',
                categorieId: 1,
                courseName: '',
                description: '',
            });

        expectValidationError(res);
        expect(CourseService.updateCourse).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CourseService.updateCourse.mockRejectedValue(apiError(404, 'Course ID 50 not found'));

        const res = await request(app)
            .put('/api/courses/50')
            .set(instructorAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 50 not found');
        expect(CourseService.updateCourse).toHaveBeenCalledWith('50', validCoursePayload);
    });

    it('should update course', async () => {
        CourseService.updateCourse.mockResolvedValue({
            courseId: 2,
            ...validCoursePayload,
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .put('/api/courses/2')
            .set(instructorAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Course updated successfully');
        expect(CourseService.updateCourse).toHaveBeenCalledWith('2', validCoursePayload);
    });
});

describe('Course routes – DELETE /api/courses/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/courses/2');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/courses/2')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseService.deleteCourse).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/courses/abc')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(CourseService.deleteCourse).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        CourseService.deleteCourse.mockRejectedValue(apiError(404, 'Course ID 2 not found'));

        const res = await request(app)
            .delete('/api/courses/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 2 not found');
        expect(CourseService.deleteCourse).toHaveBeenCalledWith('2');
    });

    it('should delete course', async () => {
        CourseService.deleteCourse.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/courses/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Course deleted successfully');
        expect(CourseService.deleteCourse).toHaveBeenCalledWith('2');
    });
});
