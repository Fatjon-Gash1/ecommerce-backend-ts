import { execSync } from 'child_process';
import { logger } from '../../logger';
import * as dotenv from 'dotenv';
import * as path from 'path';
const envPath = path.resolve(process.cwd(), '.env.test');

dotenv.config({
    path: envPath,
    override: true,
});

import { getSequelize } from '../../config/db';
const sequelize = getSequelize();
import '../../models/relational';

const START_COMMAND =
    'docker-compose -f docker-compose.test.yml --env-file .env.test up -d --build --wait';

export default async function globalSetup() {
    startContainers();
    await setupDatabase();
}

function startContainers() {
    logger.log('GLOBAL SETUP: Starting Docker Containers');

    try {
        logger.log('Waiting for database and cache services to be healthy...');

        execSync(START_COMMAND, { stdio: 'inherit' });

        logger.log('GLOBAL SETUP COMPLETE: Services are running and healthy');
    } catch (error) {
        logger.error('Failed to set up Docker containers:');
        logger.error(String(error));

        throw error;
    }
}

async function setupDatabase() {
    logger.log('Starting integration test setup...');

    try {
        logger.log('Waiting for MySQL process stabilization...');
        await delay(2000);

        await attemptDatabaseConnection();

        await sequelize.sync({ force: true });
        logger.log('MySQL schema created for tests');
    } catch (err) {
        logger.error('MySQL connection failed during tests: ' + err);
        throw err;
    }
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attemptDatabaseConnection(maxRetries = 5, initialDelay = 1000) {
    let lastError: unknown = null;

    logger.log(
        `Starting MySQL connection attempt (max retries: ${maxRetries})...`
    );

    for (let i = 0; i < maxRetries; i++) {
        try {
            await sequelize.authenticate();
            logger.log(
                'MySQL connected for tests after ' + (i + 1) + ' attempts.'
            );
            return;
        } catch (err) {
            lastError = err;
            if (i < maxRetries - 1) {
                logger.log(
                    `MySQL connection attempt ${i + 1} failed (Connection Lost). Retrying in ${initialDelay * (i + 1)}ms...`
                );
                await delay(initialDelay * (i + 1));
            }
        }
    }
    logger.error('Failed to connect to MySQL after all retries.' + lastError);
    throw lastError;
}
