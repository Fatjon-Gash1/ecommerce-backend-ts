import { Sequelize } from 'sequelize';
import { logger } from '@/services/Logger.service';

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE as string,
    process.env.MYSQL_USER as string,
    process.env.MYSQL_PASSWORD as string,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

sequelize
    .authenticate()
    .then(() => {
        logger.log('Connection to MySQL has been established successfully.');
    })
    .catch((err: Error) => {
        logger.error('Unable to connect to the MySQL database:' + err);
        process.exit(1);
    });

export default sequelize;
