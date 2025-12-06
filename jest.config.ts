import type { Config } from 'jest';

const sharedConfig: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/tests'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

const config: Config = {
    projects: [
        {
            ...sharedConfig,
            displayName: 'unit',
            testMatch: ['<rootDir>/src/tests/**/*.unit.test.ts'],
            setupFilesAfterEnv: [
                '<rootDir>/src/tests/unit/setupEnv.ts',
                '<rootDir>/src/tests/unit/setupMocks.ts',
            ],
        },
        {
            ...sharedConfig,
            displayName: 'integration',
            testMatch: [
                '<rootDir>/src/tests/integration/tests/**/*.int.test.ts',
            ],
            globalSetup: '<rootDir>/src/tests/integration/globalSetup.ts',
            globalTeardown: '<rootDir>/src/tests/integration/globalTeardown.ts',
            setupFilesAfterEnv: [
                '<rootDir>/src/tests/integration/setupIntegration.ts',
            ],
            setupFiles: ['<rootDir>/src/tests/integration/loadMocks.ts'],
        },
    ],
    //collectCoverage: true,
    //coverageDirectory: 'coverage',
    //collectCoverageFrom: [
    //    'src/services/Admin.service.ts',
    //    'src/services/Cart.service.ts',
    //    'src/services/Logging.service.ts',
    //    'src/services/Order.service.ts',
    //    'src/services/Payment.service.ts',
    //    'src/services/Product.service.ts',
    //    'src/services/subscription_service/Scheduler.ts',
    //    'src/services/Shipping.service.ts',
    //    'src/services/subscription_service/index.ts',
    //    'src/services/User.service.ts',
    //],
    //coverageThreshold: {
    //    global: {
    //        branches: 60,
    //        functions: 30,
    //        lines: 20,
    //        statements: 30,
    //    },
    //},
};

export default config;
