const originalEnv = process.env;

describe('UserService salt rounds configuration', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    it('should use default bcrypt salt rounds when env value is missing', async () => {
        process.env = { ...originalEnv };
        delete process.env.BCRYPT_SALT_ROUNDS;

        let UserService;
        let UserRepository;
        let bcrypt;

        jest.isolateModules(() => {
            jest.doMock('../../src/domain/repositories/UserRepository', () => ({
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

            jest.doMock('bcrypt', () => ({
                hash: jest.fn(),
                compare: jest.fn(),
            }));

            jest.doMock('../../src/config/jwt', () => ({
                signAccessToken: jest.fn(),
            }));

            UserService = require('../../src/services/UserService');
            UserRepository = require('../../src/domain/repositories/UserRepository');
            bcrypt = require('bcrypt');
        });

        UserRepository.emailExists.mockResolvedValue(false);
        bcrypt.hash.mockResolvedValue('hashed-password');
        UserRepository.createUser.mockResolvedValue(10);
        UserRepository.getUserById.mockResolvedValue({
            userId: 10,
            email: 'default-salt@example.com',
            userType: 'student',
            createdAt: '2025-01-01',
        });

        await UserService.createUser({
            email: 'default-salt@example.com',
            password: 'Strong@1234',
            userType: 'student',
        });

        expect(bcrypt.hash).toHaveBeenCalledWith('Strong@1234', 10);
    });
});
