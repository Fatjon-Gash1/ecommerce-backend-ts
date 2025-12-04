import { getSequelize } from '@/config/db';
import { redisClient } from '@/config/redis';
import { logger } from '@/logger';
import { QueryTypes } from 'sequelize';
const sequelize = getSequelize();

const dataTablesToTruncate = [
    'users',
    'admins',
    'customers',
    'categories',
    'products',
    'carts',
];

async function cleanupDatabase() {
    logger.log('Clearing test database tables...');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

    for (const tableName of dataTablesToTruncate) {
        try {
            await sequelize.query(`TRUNCATE TABLE \`${tableName}\``, {
                type: QueryTypes.RAW,
            });
        } catch (error) {
            logger.error(`Failed to truncate table ${tableName}:` + error);
            throw error;
        }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    logger.log('Database cleanup complete.');
}

beforeEach(async () => {
    await cleanupDatabase();
    await redisClient.flushdb();
});
