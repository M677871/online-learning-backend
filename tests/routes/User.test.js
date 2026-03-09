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


beforeEach(() => {
    jest.clearAllMocks();
});

describe('User routes – POST /api/users', () => {
    it('should create a user', async () => {
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

    it('should return 400 for invalid payload', async () => {
        const res = await request(app).post('/api/users').send({
            email: 'bad',
            password: 'weak',
            userType: 'admin',
        });

        expectValidationError(res);
        expect(UserService.createUser).not.toHaveBeenCalled();
    });

    it('should return conflict when email already exists', async () => {
        UserService.createUser.mockRejectedValue(apiError(409, 'Email already exists'));

        const res = await request(app).post('/api/users').send(validCreatePayload);

        expect(res.status).toBe(409);
        expect(res.body).toEqual({
            success: false,
            message: 'Email already exists',
        });
        expect(UserService.createUser).toHaveBeenCalledWith(validCreatePayload);
    });
});

describe('User routes – POST /api/users/login', () => {
    it('should authenticate user', async () => {
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

    it('should validate required fields', async () => {
        const res = await request(app).post('/api/users/login').send({ email: '' });
        expectValidationError(res);
        expect(UserService.login).not.toHaveBeenCalled();
    });

    it('should handle invalid credentials', async () => {
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
});

describe('User routes – GET /api/users', () => {
    it('should require authentication', async () => {
        const res = await request(app).get('/api/users');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .get('/api/users')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
    });

    it('should return users for instructor', async () => {
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

    it('should return 500 when service fails', async () => {
        UserService.getAllUsers.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app)
            .get('/api/users')
            .set(instructorAuthHeader());

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('User routes – GET /api/users/:id', () => {
    it('should validate id parameter', async () => {
        const res = await request(app)
            .get('/api/users/not-int')
            .set(authHeader());

        expectValidationError(res);
        expect(UserService.getUserById).not.toHaveBeenCalled();
    });

    it('should require authentication', async () => {
        const res = await request(app).get('/api/users/3');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should return 404 when resource is not found', async () => {
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

    it('should return user', async () => {
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
});

describe('User routes – GET /api/users/email/:email', () => {
    it('should require authentication', async () => {
        const res = await request(app).get('/api/users/email/student@example.com');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should validate email parameter', async () => {
        const res = await request(app)
            .get('/api/users/email/not-an-email')
            .set(authHeader());

        expectValidationError(res);
        expect(UserService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should return user', async () => {
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

    it('should return 404 when resource is not found', async () => {
        UserService.getUserByEmail.mockRejectedValue(apiError(404, 'User with email missing@example.com not found'));

        const res = await request(app)
            .get('/api/users/email/missing@example.com')
            .set(authHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User with email missing@example.com not found');
        expect(UserService.getUserByEmail).toHaveBeenCalledWith('missing@example.com');
    });
});

describe('User routes – PUT /api/users/changePassword', () => {
    it('should require authentication', async () => {
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

    it('should validate payload', async () => {
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

    it('should update password', async () => {
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

    it('should return 500 when password change fails unexpectedly', async () => {
        UserService.changePassword.mockRejectedValue(new Error('Unexpected failure'));

        const res = await request(app)
            .put('/api/users/changePassword')
            .set(authHeader())
            .send({
                email: 'student@example.com',
                currentPassword: 'Current@1234',
                newPassword: 'NewStrong@1234',
            });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Unexpected failure',
        });
    });
});

describe('User routes – PUT /api/users/:id', () => {
    it('should require instructor role', async () => {
        const res = await request(app)
            .put('/api/users/2')
            .set(studentAuthHeader())
            .send(validCreatePayload);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(UserService.updateUser).not.toHaveBeenCalled();
    });

    it('should require authentication', async () => {
        const res = await request(app)
            .put('/api/users/2')
            .send(validCreatePayload);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should validate payload', async () => {
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

    it('should return not found when user does not exist', async () => {
        UserService.updateUser.mockRejectedValue(apiError(404, 'User ID 200 not found'));

        const res = await request(app)
            .put('/api/users/200')
            .set(instructorAuthHeader())
            .send(validCreatePayload);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User ID 200 not found');
        expect(UserService.updateUser).toHaveBeenCalledWith('200', validCreatePayload);
    });

    it('should update user', async () => {
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
});

describe('User routes – DELETE /api/users/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/users/2');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Missing or invalid Authorization header');
    });

    it('should require instructor role', async () => {
        const res = await request(app)
            .delete('/api/users/2')
            .set(studentAuthHeader());

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access denied. Required role(s): instructor');
        expect(UserService.deleteUser).not.toHaveBeenCalled();
    });

    it('should validate id parameter', async () => {
        const res = await request(app)
            .delete('/api/users/not-int')
            .set(instructorAuthHeader());

        expectValidationError(res);
        expect(UserService.deleteUser).not.toHaveBeenCalled();
    });

    it('should return 404 when resource is not found', async () => {
        UserService.deleteUser.mockRejectedValue(apiError(404, 'User ID 20 not found'));

        const res = await request(app)
            .delete('/api/users/20')
            .set(instructorAuthHeader());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User ID 20 not found');
        expect(UserService.deleteUser).toHaveBeenCalledWith('20');
    });

    it('should delete user', async () => {
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
