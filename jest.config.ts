import type { Config } from 'jest';

const sharedConfig: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
};

const config: Config = {
    projects: [
        {
            ...sharedConfig,
            displayName: 'unit',
            testMatch: ['<rootDir>/tests/**/*.unit.test.ts'],
            setupFilesAfterEnv: [
                '<rootDir>/tests/unit/setupEnv.ts',
                '<rootDir>/tests/unit/setupMocks.ts',
            ],
        },

        {
            ...sharedConfig,
            displayName: 'integration',
            testMatch: ['<rootDir>/tests/integration/tests/**/*.int.test.ts'],
            globalSetup: '<rootDir>/tests/integration/globalSetup.ts',
            globalTeardown: '<rootDir>/tests/integration/globalTeardown.ts',
            setupFilesAfterEnv: [
                '<rootDir>/tests/integration/setupIntegration.ts',
            ],
            setupFiles: ['<rootDir>/tests/integration/loadMocks.ts'],
        },
    ],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'services/Admin.service.ts',
        'services/Cart.service.ts',
        'services/Logging.service.ts',
        'services/Order.service.ts',
        'services/Payment.service.ts',
        'services/Product.service.ts',
        'services/subscription_service/Scheduler.ts',
        'services/Shipping.service.ts',
        'services/subscription_service/index.ts',
        'services/User.service.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 20,
            lines: 20,
            statements: 25,
        },
    },
};

export default config;
