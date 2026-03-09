const originalEnv = process.env;

describe('JWT config module', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    it('should throw when JWT_SECRET is missing', () => {
        process.env = {
            ...originalEnv,
            JWT_SECRET: '',
        };

        expect(() => {
            jest.isolateModules(() => {
                require('../../src/config/jwt');
            });
        }).toThrow('JWT_SECRET is not defined in environment variables');
    });

    it('should sign and verify tokens using configured secret and issuer', () => {
        process.env = {
            ...originalEnv,
            JWT_SECRET: 'test-secret',
            JWT_EXPIRES_IN: '2h',
            JWT_ISSUER: 'test-issuer',
        };

        jest.isolateModules(() => {
            jest.doMock('jsonwebtoken', () => ({
                sign: jest.fn().mockReturnValue('signed-token'),
                verify: jest.fn().mockReturnValue({ id: 1, email: 'a@b.com', userType: 'student' }),
            }));

            const jwtLib = require('jsonwebtoken');
            const { signAccessToken, verifyAccessToken } = require('../../src/config/jwt');

            const token = signAccessToken({ id: 1, email: 'a@b.com', userType: 'student' });
            const decoded = verifyAccessToken(token);

            expect(token).toBe('signed-token');
            expect(decoded).toEqual({ id: 1, email: 'a@b.com', userType: 'student' });

            expect(jwtLib.sign).toHaveBeenCalledWith(
                { id: 1, email: 'a@b.com', userType: 'student' },
                'test-secret',
                { expiresIn: '2h', issuer: 'test-issuer' }
            );
            expect(jwtLib.verify).toHaveBeenCalledWith('signed-token', 'test-secret', { issuer: 'test-issuer' });
        });
    });

    it('should use default expiresIn and issuer when not provided', () => {
        process.env = {
            ...originalEnv,
            JWT_SECRET: 'test-secret',
        };
        delete process.env.JWT_EXPIRES_IN;
        delete process.env.JWT_ISSUER;

        jest.isolateModules(() => {
            jest.doMock('jsonwebtoken', () => ({
                sign: jest.fn().mockReturnValue('signed-token'),
                verify: jest.fn().mockReturnValue({ id: 1 }),
            }));

            const jwtLib = require('jsonwebtoken');
            const { signAccessToken, verifyAccessToken } = require('../../src/config/jwt');

            signAccessToken({ id: 1, email: 'a@b.com', userType: 'student' });
            verifyAccessToken('signed-token');

            expect(jwtLib.sign).toHaveBeenCalledWith(
                { id: 1, email: 'a@b.com', userType: 'student' },
                'test-secret',
                { expiresIn: '1h', issuer: 'online-learning-api' }
            );
            expect(jwtLib.verify).toHaveBeenCalledWith('signed-token', 'test-secret', { issuer: 'online-learning-api' });
        });
    });
});
