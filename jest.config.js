module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    setupFiles: ['<rootDir>/tests/setup/env.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.afterEnv.js'],
    globalTeardown: '<rootDir>/tests/setup/teardown.js',
    clearMocks: true,
    restoreMocks: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
    ],
};
