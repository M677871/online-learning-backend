const request = require('supertest');
const {
    instructorAuthHeader,
    studentAuthHeader,
    authHeader,
    apiError,
    expectValidationError,
} = require('../helpers/routeTestUtils');

jest.mock('../../src/config/db', () => ({
    getConnection: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/UserService', () => ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    login: jest.fn(),
    changePassword: jest.fn(),
}));

const UserService = require('../../src/services/UserService');
const app = require('../../src/app');

const validCreatePayload = {
    email: 'newuser@example.com',
    password: 'Strong@1234',
    userType: 'student',
};

describe('User routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/users creates a user', async () => {
        UserService.createUser.mockResolvedValue({
            userId: 5,
            email: validCreatePayload.email,
            userType: validCreatePayload.userType,
            createdAt: '2025-01-01',
        });

        const res = await request(app).post('/api/users').send(validCreatePayload);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User created successfully');
        expect(res.body.data).toEqual({
            userId: 5,
            email: validCreatePayload.email,
            userType: validCreatePayload.userType,
            createdAt: '2025-01-01',
        });
        expect(UserService.createUser).toHaveBeenCalledWith(validCreatePayload);
    });

    test('POST /api/users returns 400 for invalid payload', async () => {
        const res = await request(app).post('/api/users').send({
            email: 'bad',
            password: 'weak',
            userType: 'admin',
        });

        expectValidationError(res);
        expect(UserService.createUser).not.toHaveBeenCalled();
    });

    test('POST /api/users returns conflict when email already exists', async () => {
        UserService.createUser.mockRejectedValue(apiError(409, 'Email already exists'));

        const res = await request(app).post('/api/users').send(validCreatePayload);

        expect(res.status).toBe(409);
        expect(res.body).toEqual({
            success: false,
            message: 'Email already exists',
        });
        expect(UserService.createUser).toHaveBeenCalledWith(validCreatePayload);
    });

    test('POST /api/users/login authenticates user', async () => {
        UserService.login.mockResolvedValue({
            token: 'jwt-token',
            user: {
                userId: 2,
                email: 'teacher@example.com',
                userType: 'instructor',
                createdAt: '2025-01-01',
            },
        });

        const res = await request(app).post('/api/users/login').send({
            email: 'teacher@example.com',
            password: 'Strong@1234',
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBe('jwt-token');
        expect(res.body.data.user).toEqual({
            userId: 2,
            email: 'teacher@example.com',
            userType: 'instructor',
            createdAt: '2025-01-01',
        });
        expect(UserService.login).toHaveBeenCalledWith('teacher@example.com', 'Strong@1234');
    });

    test('POST /api/users/login validates required fields', async () => {
        const res = await request(app).post('/api/users/login').send({ email: '' });
        expectValidationError(res);
        expect(UserService.login).not.toHaveBeenCalled();
    });

    test('POST /api/users/login handles invalid credentials', async () => {
        UserService.login.mockRejectedValue(apiError(401, 'Invalid email or password'));

        const res = await request(app).post('/api/users/login').send({
            email: 'teacher@example.com',
            password: 'wrong',
        });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: 'Invalid email or password',
        });
        expect(UserService.login).toHaveBeenCalledWith('teacher@example.com', 'wrong');
    });

    test('GET /api/users requires authentication', async () => {
        const res = await request(app).get('/api/users');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('GET /api/users requires instructor role', async () => {
        const res = await request(app)
            .get('/api/users')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
    });

    test('GET /api/users returns users for instructor', async () => {
        UserService.getAllUsers.mockResolvedValue([
            {
                userId: 1,
                email: 'student@example.com',
                userType: 'student',
                createdAt: '2025-01-01',
            },
        ]);

        const res = await request(app)
            .get('/api/users')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([
            {
                userId: 1,
                email: 'student@example.com',
                userType: 'student',
                createdAt: '2025-01-01',
            },
        ]);
        expect(UserService.getAllUsers).toHaveBeenCalledTimes(1);
    });

    test('GET /api/users/:id validates id parameter', async () => {
        const res = await request(app)
            .get('/api/users/not-int')
            .set(authHeader());

        expectValidationError(res);
        expect(UserService.getUserById).not.toHaveBeenCalled();
    });

    test('GET /api/users/:id requires authentication', async () => {
        const res = await request(app).get('/api/users/3');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('GET /api/users/:id returns not found', async () => {
        UserService.getUserById.mockRejectedValue(apiError(404, 'User ID 99 not found'));

        const res = await request(app)
            .get('/api/users/99')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            success: false,
            message: 'User ID 99 not found',
        });
        expect(UserService.getUserById).toHaveBeenCalledWith('99');
    });

    test('GET /api/users/:id returns user', async () => {
        UserService.getUserById.mockResolvedValue({
            userId: 3,
            email: 'student@example.com',
            userType: 'student',
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .get('/api/users/3')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            userId: 3,
            email: 'student@example.com',
            userType: 'student',
            createdAt: '2025-01-01',
        });
        expect(UserService.getUserById).toHaveBeenCalledWith('3');
    });

    test('GET /api/users/email/:email requires authentication', async () => {
        const res = await request(app).get('/api/users/email/student@example.com');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('GET /api/users/email/:email validates email parameter', async () => {
        const res = await request(app)
            .get('/api/users/email/not-an-email')
            .set(authHeader());

        expectValidationError(res);
        expect(UserService.getUserByEmail).not.toHaveBeenCalled();
    });

    test('GET /api/users/email/:email returns user', async () => {
        UserService.getUserByEmail.mockResolvedValue({
            userId: 3,
            email: 'student@example.com',
            userType: 'student',
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .get('/api/users/email/student@example.com')
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe('student@example.com');
        expect(UserService.getUserByEmail).toHaveBeenCalledWith('student@example.com');
    });

    test('GET /api/users/email/:email returns not found', async () => {
        UserService.getUserByEmail.mockRejectedValue(apiError(404, 'User with email missing@example.com not found'));

        const res = await request(app)
            .get('/api/users/email/missing@example.com')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User with email missing@example.com not found');
        expect(UserService.getUserByEmail).toHaveBeenCalledWith('missing@example.com');
    });

    test('PUT /api/users/changePassword requires authentication', async () => {
        const res = await request(app)
            .put('/api/users/changePassword')
            .send({
                email: 'student@example.com',
                currentPassword: 'Current@1234',
                newPassword: 'NewStrong@1234',
            });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('PUT /api/users/changePassword validates payload', async () => {
        const res = await request(app)
            .put('/api/users/changePassword')
            .set(authHeader())
            .send({
                email: 'bad',
                currentPassword: '',
                newPassword: '123',
            });

        expectValidationError(res);
        expect(UserService.changePassword).not.toHaveBeenCalled();
    });

    test('PUT /api/users/changePassword updates password', async () => {
        UserService.changePassword.mockResolvedValue(undefined);

        const res = await request(app)
            .put('/api/users/changePassword')
            .set(authHeader())
            .send({
                email: 'student@example.com',
                currentPassword: 'Current@1234',
                newPassword: 'NewStrong@1234',
            });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: 'Password changed successfully',
        });
        expect(UserService.changePassword).toHaveBeenCalledWith(
            'student@example.com',
            'Current@1234',
            'NewStrong@1234'
        );
    });

    test('PUT /api/users/:id denies non-instructor users', async () => {
        const res = await request(app)
            .put('/api/users/2')
            .set(studentAuthHeader())
            .send(validCreatePayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(UserService.updateUser).not.toHaveBeenCalled();
    });

    test('PUT /api/users/:id requires authentication', async () => {
        const res = await request(app)
            .put('/api/users/2')
            .send(validCreatePayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('PUT /api/users/:id validates payload', async () => {
        const res = await request(app)
            .put('/api/users/2')
            .set(instructorAuthHeader())
            .send({
                email: 'bad',
                password: 'weak',
                userType: 'admin',
            });

        expectValidationError(res);
        expect(UserService.updateUser).not.toHaveBeenCalled();
    });

    test('PUT /api/users/:id returns not found when user does not exist', async () => {
        UserService.updateUser.mockRejectedValue(apiError(404, 'User ID 200 not found'));

        const res = await request(app)
            .put('/api/users/200')
            .set(instructorAuthHeader())
            .send(validCreatePayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User ID 200 not found');
        expect(UserService.updateUser).toHaveBeenCalledWith('200', validCreatePayload);
    });

    test('PUT /api/users/:id updates user', async () => {
        UserService.updateUser.mockResolvedValue({
            userId: 2,
            email: 'updated@example.com',
            userType: 'instructor',
            createdAt: '2025-01-01',
        });

        const res = await request(app)
            .put('/api/users/2')
            .set(instructorAuthHeader())
            .send({
                email: 'updated@example.com',
                password: 'Strong@1234',
                userType: 'instructor',
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('User updated successfully');
        expect(res.body.data.email).toBe('updated@example.com');
        expect(UserService.updateUser).toHaveBeenCalledWith('2', {
            email: 'updated@example.com',
            password: 'Strong@1234',
            userType: 'instructor',
        });
    });

    test('DELETE /api/users/:id requires authentication', async () => {
        const res = await request(app).delete('/api/users/2');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    test('DELETE /api/users/:id requires instructor role', async () => {
        const res = await request(app)
            .delete('/api/users/2')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(UserService.deleteUser).not.toHaveBeenCalled();
    });

    test('DELETE /api/users/:id validates id parameter', async () => {
        const res = await request(app)
            .delete('/api/users/not-int')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(UserService.deleteUser).not.toHaveBeenCalled();
    });

    test('DELETE /api/users/:id returns not found', async () => {
        UserService.deleteUser.mockRejectedValue(apiError(404, 'User ID 20 not found'));

        const res = await request(app)
            .delete('/api/users/20')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User ID 20 not found');
        expect(UserService.deleteUser).toHaveBeenCalledWith('20');
    });

    test('DELETE /api/users/:id deletes user', async () => {
        UserService.deleteUser.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/users/2')
            .set(instructorAuthHeader());

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: 'User deleted successfully',
        });
        expect(UserService.deleteUser).toHaveBeenCalledWith('2');
    });
});
