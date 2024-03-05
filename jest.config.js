const config = {
    verbose: true,
    testEnvironment: 'node',
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/(?!(chai)/)',
    ],
    // setupFilesAfterEnv: ['./jest.setup.js'],
    testMatch: ['**/test/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
    testPathIgnorePatterns: ['<rootDir>/test/utils/'],
};

export default config;
