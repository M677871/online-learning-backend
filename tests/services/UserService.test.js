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

    test('getAllUsers returns users', async () => {
        const users = [{ userId: 1, email: 'student@example.com', userType: 'student' }];
        UserRepository.getAllUsers.mockResolvedValue(users);

        const result = await UserService.getAllUsers();

        expect(result).toEqual(users);
        expect(UserRepository.getAllUsers).toHaveBeenCalledTimes(1);
    });

    test('getAllUsers wraps repository errors', async () => {
        UserRepository.getAllUsers.mockRejectedValue(new Error('db down'));

        await expect(UserService.getAllUsers()).rejects.toThrow('db down');
    });

    test('getUserById throws not found when user does not exist', async () => {
        UserRepository.getUserById.mockResolvedValue(null);

        await expect(UserService.getUserById(404)).rejects.toMatchObject({
            statusCode: 404,
            message: 'User ID 404 not found',
        });
    });

    test('getUserById returns user when found', async () => {
        const user = { userId: 4, email: 'found@example.com', userType: 'student' };
        UserRepository.getUserById.mockResolvedValue(user);

        const result = await UserService.getUserById(4);

        expect(result).toEqual(user);
    });

    test('getUserByEmail throws not found when email is missing', async () => {
        UserRepository.getUserByEmail.mockResolvedValue(null);

        await expect(UserService.getUserByEmail('missing@example.com')).rejects.toMatchObject({
            statusCode: 404,
            message: 'User with email missing@example.com not found',
        });
    });

    test('getUserByEmail maps row to user entity', async () => {
        UserRepository.getUserByEmail.mockResolvedValue({
            user_id: 3,
            email: 'student@example.com',
            password_hash: 'hash',
            user_type: 'student',
            create_at: '2025-01-01',
        });

        const result = await UserService.getUserByEmail('student@example.com');

        expect(result).toMatchObject({
            userId: 3,
            email: 'student@example.com',
            userType: 'student',
        });
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

    test('updateUser throws not found when user does not exist', async () => {
        UserRepository.getUserById.mockResolvedValue(null);

        await expect(
            UserService.updateUser(500, {
                email: 'updated@example.com',
                password: 'Strong@1234',
                userType: 'student',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'User ID 500 not found',
        });
    });

    test('updateUser throws conflict when new email already exists', async () => {
        UserRepository.getUserById.mockResolvedValue({
            userId: 2,
            email: 'old@example.com',
            userType: 'student',
        });
        UserRepository.emailExists.mockResolvedValue(true);

        await expect(
            UserService.updateUser(2, {
                email: 'new@example.com',
                password: '',
                userType: 'student',
            })
        ).rejects.toMatchObject({
            statusCode: 409,
            message: 'Email new@example.com already exists',
        });
    });

    test('updateUser updates non-password fields without hashing', async () => {
        UserRepository.getUserById
            .mockResolvedValueOnce({
                userId: 2,
                email: 'old@example.com',
                userType: 'student',
            })
            .mockResolvedValueOnce({
                userId: 2,
                email: 'new@example.com',
                userType: 'instructor',
            });
        UserRepository.emailExists.mockResolvedValue(false);
        UserRepository.updateUser.mockResolvedValue(1);

        const result = await UserService.updateUser(2, {
            email: 'new@example.com',
            password: '',
            userType: 'instructor',
        });

        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(UserRepository.updateUser).toHaveBeenCalledWith(2, {
            email: 'new@example.com',
            userType: 'instructor',
        });
        expect(result).toMatchObject({
            userId: 2,
            email: 'new@example.com',
            userType: 'instructor',
        });
    });

    test('updateUser hashes password when provided', async () => {
        UserRepository.getUserById
            .mockResolvedValueOnce({
                userId: 2,
                email: 'old@example.com',
                userType: 'student',
            })
            .mockResolvedValueOnce({
                userId: 2,
                email: 'old@example.com',
                userType: 'student',
            });
        bcrypt.hash.mockResolvedValue('rehashed');
        UserRepository.updateUser.mockResolvedValue(1);

        await UserService.updateUser(2, {
            email: 'old@example.com',
            password: 'NewStrong@1234',
            userType: 'student',
        });

        expect(bcrypt.hash).toHaveBeenCalledWith('NewStrong@1234', expect.any(Number));
        expect(UserRepository.updateUser).toHaveBeenCalledWith(2, {
            email: 'old@example.com',
            userType: 'student',
            passwordHash: 'rehashed',
        });
    });

    test('updateUser can update password without email/userType fields', async () => {
        UserRepository.getUserById
            .mockResolvedValueOnce({
                userId: 4,
                email: 'same@example.com',
                userType: 'student',
            })
            .mockResolvedValueOnce({
                userId: 4,
                email: 'same@example.com',
                userType: 'student',
            });
        bcrypt.hash.mockResolvedValue('hashed-only-password');
        UserRepository.updateUser.mockResolvedValue(1);

        await UserService.updateUser(4, {
            password: 'OnlyPassword@123',
        });

        expect(UserRepository.updateUser).toHaveBeenCalledWith(4, {
            passwordHash: 'hashed-only-password',
        });
    });

    test('deleteUser throws not found when user does not exist', async () => {
        UserRepository.userExistsById.mockResolvedValue(false);

        await expect(UserService.deleteUser(11)).rejects.toMatchObject({
            statusCode: 404,
            message: 'User ID 11 not found',
        });
    });

    test('deleteUser deletes existing user', async () => {
        UserRepository.userExistsById.mockResolvedValue(true);
        UserRepository.deleteUser.mockResolvedValue(1);

        await UserService.deleteUser(11);

        expect(UserRepository.deleteUser).toHaveBeenCalledWith(11);
    });

    test('login throws unauthorized when email does not exist', async () => {
        UserRepository.getUserByEmail.mockResolvedValue(null);

        await expect(UserService.login('missing@example.com', 'Strong@1234')).rejects.toMatchObject({
            statusCode: 401,
            message: 'Invalid email or password',
        });
    });

    test('changePassword throws not found when email does not exist', async () => {
        UserRepository.getUserByEmail.mockResolvedValue(null);

        await expect(
            UserService.changePassword('missing@example.com', 'Current@1234', 'NewStrong@1234')
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'User with email missing@example.com not found',
        });
    });

    test('changePassword hashes and updates stored password', async () => {
        UserRepository.getUserByEmail.mockResolvedValue({
            user_id: 9,
            email: 'student@example.com',
            password_hash: 'stored-hash',
            user_type: 'student',
            create_at: '2025-01-01',
        });
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue('new-hash');
        UserRepository.updatePasswordHash.mockResolvedValue(1);

        await UserService.changePassword('student@example.com', 'Current@1234', 'NewStrong@1234');

        expect(bcrypt.hash).toHaveBeenCalledWith('NewStrong@1234', expect.any(Number));
        expect(UserRepository.updatePasswordHash).toHaveBeenCalledWith(9, 'new-hash');
    });
});
