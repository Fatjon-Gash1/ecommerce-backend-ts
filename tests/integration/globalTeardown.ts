import { execSync } from 'child_process';
import { logger } from '../../logger';
import { redisClient } from '../../config/redis';
import { getSequelize } from '../../config/db';
const sequelize = getSequelize();

const DOWN_COMMAND = 'docker-compose -f docker-compose.test.yml down -v';

export default async function globalTeardown() {
    await teardownDatabase();
    stopContainers();
}

function stopContainers() {
    logger.log('GLOBAL TEARDOWN: Stopping Docker Containers');

    try {
        execSync(DOWN_COMMAND, { stdio: 'inherit' });
        logger.log('GLOBAL TEARDOWN COMPLETE: Containers stopped');
    } catch (error) {
        logger.error('Failed to tear down Docker containers:');
        logger.error(String(error));
    }
}

async function teardownDatabase() {
    logger.log('Cleaning up integration test environment...');

    try {
        await sequelize.query('DROP SCHEMA IF EXISTS `test_db`', { raw: true });
        await sequelize.close();
    } catch (err) {
        logger.error('Error closing MySQL: ' + err);
    }

    try {
        await redisClient.flushdb();
        await redisClient.quit();
    } catch (err) {
        logger.error('Error closing Redis: ' + err);
    }
}
