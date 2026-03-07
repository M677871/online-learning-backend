jest.mock('../../src/domain/repositories/UserRepository', () => ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    emailExists: jest.fn(),
    userExistsById: jest.fn(),
    updatePasswordHash: jest.fn(),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('../../src/config/jwt', () => ({
    signAccessToken: jest.fn(),
}));

const UserService = require('../../src/services/UserService');
const UserRepository = require('../../src/domain/repositories/UserRepository');
const bcrypt = require('bcrypt');
const { signAccessToken } = require('../../src/config/jwt');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createUser throws conflict when email already exists', async () => {
        UserRepository.emailExists.mockResolvedValue(true);

        await expect(
            UserService.createUser({
                email: 'exists@example.com',
                password: 'Strong@1234',
                userType: 'student',
            })
        ).rejects.toMatchObject({
            statusCode: 409,
            message: 'Email exists@example.com already exists',
        });
    });

    test('createUser hashes password and returns created user', async () => {
        const createdUser = {
            userId: 5,
            email: 'new@example.com',
            userType: 'student',
            createdAt: '2025-01-01',
        };

        UserRepository.emailExists.mockResolvedValue(false);
        bcrypt.hash.mockResolvedValue('hashed-password');
        UserRepository.createUser.mockResolvedValue(5);
        UserRepository.getUserById.mockResolvedValue(createdUser);

        const result = await UserService.createUser({
            email: 'new@example.com',
            password: 'Strong@1234',
            userType: 'student',
        });

        expect(bcrypt.hash).toHaveBeenCalledWith('Strong@1234', expect.any(Number));
        expect(UserRepository.createUser).toHaveBeenCalledWith({
            email: 'new@example.com',
            passwordHash: 'hashed-password',
            userType: 'student',
        });
        expect(result).toEqual(createdUser);
    });

    test('login throws unauthorized when password is invalid', async () => {
        UserRepository.getUserByEmail.mockResolvedValue({
            user_id: 5,
            email: 'user@example.com',
            password_hash: 'stored-hash',
            user_type: 'student',
            create_at: '2025-01-01',
        });
        bcrypt.compare.mockResolvedValue(false);

        await expect(
            UserService.login('user@example.com', 'wrong-password')
        ).rejects.toMatchObject({
            statusCode: 401,
            message: 'Invalid email or password',
        });
    });

    test('login returns token and user entity when credentials are valid', async () => {
        UserRepository.getUserByEmail.mockResolvedValue({
            user_id: 8,
            email: 'instructor@example.com',
            password_hash: 'stored-hash',
            user_type: 'instructor',
            create_at: '2025-01-01',
        });
        bcrypt.compare.mockResolvedValue(true);
        signAccessToken.mockReturnValue('signed-token');

        const result = await UserService.login('instructor@example.com', 'Strong@1234');

        expect(signAccessToken).toHaveBeenCalledWith({
            id: 8,
            email: 'instructor@example.com',
            userType: 'instructor',
        });
        expect(result.token).toBe('signed-token');
        expect(result.user).toMatchObject({
            userId: 8,
            email: 'instructor@example.com',
            userType: 'instructor',
        });
    });

    test('changePassword throws unauthorized when current password is incorrect', async () => {
        UserRepository.getUserByEmail.mockResolvedValue({
            user_id: 9,
            email: 'student@example.com',
            password_hash: 'stored-hash',
            user_type: 'student',
            create_at: '2025-01-01',
        });
        bcrypt.compare.mockResolvedValue(false);

        await expect(
            UserService.changePassword('student@example.com', 'wrong-current', 'NewStrong@1234')
        ).rejects.toMatchObject({
            statusCode: 401,
            message: 'Current password is incorrect',
        });
    });
});
