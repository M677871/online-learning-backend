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

describe('Course routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/courses returns courses', async () => {
        CourseService.getAllCourses.mockResolvedValue([
            { courseId: 1, ...validCoursePayload, createdAt: '2025-01-01' },
        ]);

        const res = await request(app).get('/api/courses');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].courseName).toBe('Node Fundamentals');
        expect(CourseService.getAllCourses).toHaveBeenCalledTimes(1);
    });

    test('GET /api/courses/:id validates id', async () => {
        const res = await request(app).get('/api/courses/not-int');
        expectValidationError(res);
        expect(CourseService.getCourseById).not.toHaveBeenCalled();
    });

    test('GET /api/courses/:id returns not found', async () => {
        CourseService.getCourseById.mockRejectedValue(apiError(404, 'Course ID 99 not found'));

        const res = await request(app).get('/api/courses/99');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 99 not found');
        expect(CourseService.getCourseById).toHaveBeenCalledWith('99');
    });

    test('GET /api/courses/:id returns a course', async () => {
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

    test('GET /api/courses/instructorByCourseId/:id validates id', async () => {
        const res = await request(app).get('/api/courses/instructorByCourseId/not-int');

        expectValidationError(res);
        expect(CourseService.getInstructorByCourseId).not.toHaveBeenCalled();
    });

    test('GET /api/courses/instructorByCourseId/:id returns not found', async () => {
        CourseService.getInstructorByCourseId.mockRejectedValue(apiError(404, 'Course ID 101 not found'));

        const res = await request(app).get('/api/courses/instructorByCourseId/101');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 101 not found');
        expect(CourseService.getInstructorByCourseId).toHaveBeenCalledWith('101');
    });

    test('GET /api/courses/instructorByCourseId/:id returns instructor', async () => {
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

    test('GET /api/courses/stdOfCourse/:id validates id', async () => {
        const res = await request(app).get('/api/courses/stdOfCourse/abc');

        expectValidationError(res);
        expect(CourseService.getStudentsOfCourse).not.toHaveBeenCalled();
    });

    test('GET /api/courses/stdOfCourse/:id returns not found', async () => {
        CourseService.getStudentsOfCourse.mockRejectedValue(apiError(404, 'Course ID 404 not found'));

        const res = await request(app).get('/api/courses/stdOfCourse/404');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 404 not found');
        expect(CourseService.getStudentsOfCourse).toHaveBeenCalledWith('404');
    });

    test('GET /api/courses/stdOfCourse/:id returns course students', async () => {
        CourseService.getStudentsOfCourse.mockResolvedValue([
            { studend_id: 5, stu_FName: 'Jane' },
        ]);

        const res = await request(app).get('/api/courses/stdOfCourse/1');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(CourseService.getStudentsOfCourse).toHaveBeenCalledWith('1');
    });

    test('POST /api/courses requires authentication', async () => {
        const res = await request(app).post('/api/courses').send(validCoursePayload);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('POST /api/courses requires instructor role', async () => {
        const res = await request(app)
            .post('/api/courses')
            .set(studentAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseService.createCourse).not.toHaveBeenCalled();
    });

    test('POST /api/courses validates request body', async () => {
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

    test('POST /api/courses returns service not found errors', async () => {
        CourseService.createCourse.mockRejectedValue(apiError(404, 'Instructor ID 999 not found'));

        const res = await request(app)
            .post('/api/courses')
            .set(instructorAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Instructor ID 999 not found');
        expect(CourseService.createCourse).toHaveBeenCalledWith(validCoursePayload);
    });

    test('POST /api/courses creates course', async () => {
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

    test('PUT /api/courses/:id requires authentication', async () => {
        const res = await request(app)
            .put('/api/courses/2')
            .send(validCoursePayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('PUT /api/courses/:id requires instructor role', async () => {
        const res = await request(app)
            .put('/api/courses/2')
            .set(studentAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseService.updateCourse).not.toHaveBeenCalled();
    });

    test('PUT /api/courses/:id validates request', async () => {
        const res = await request(app)
            .put('/api/courses/not-int')
            .set(instructorAuthHeader())
            .send(validCoursePayload);

        expectValidationError(res);
        expect(CourseService.updateCourse).not.toHaveBeenCalled();
    });

    test('PUT /api/courses/:id validates body', async () => {
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

    test('PUT /api/courses/:id returns not found', async () => {
        CourseService.updateCourse.mockRejectedValue(apiError(404, 'Course ID 50 not found'));

        const res = await request(app)
            .put('/api/courses/50')
            .set(instructorAuthHeader())
            .send(validCoursePayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 50 not found');
        expect(CourseService.updateCourse).toHaveBeenCalledWith('50', validCoursePayload);
    });

    test('PUT /api/courses/:id updates course', async () => {
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

    test('DELETE /api/courses/:id requires authentication', async () => {
        const res = await request(app).delete('/api/courses/2');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('DELETE /api/courses/:id requires instructor role', async () => {
        const res = await request(app)
            .delete('/api/courses/2')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(CourseService.deleteCourse).not.toHaveBeenCalled();
    });

    test('DELETE /api/courses/:id validates id', async () => {
        const res = await request(app)
            .delete('/api/courses/abc')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(CourseService.deleteCourse).not.toHaveBeenCalled();
    });

    test('DELETE /api/courses/:id returns not found', async () => {
        CourseService.deleteCourse.mockRejectedValue(apiError(404, 'Course ID 2 not found'));

        const res = await request(app)
            .delete('/api/courses/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Course ID 2 not found');
        expect(CourseService.deleteCourse).toHaveBeenCalledWith('2');
    });

    test('DELETE /api/courses/:id deletes course', async () => {
        CourseService.deleteCourse.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/courses/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Course deleted successfully');
        expect(CourseService.deleteCourse).toHaveBeenCalledWith('2');
    });
});
