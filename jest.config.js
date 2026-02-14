module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/_tests_/**/*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!src/app.ts',
        '!src/__tests__/**',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/_tests_/setup.ts'],
    transformIgnorePatterns: [
        '/node_modules/(?!(uuid)/)'
    ],
};