import { Sequelize } from 'sequelize';
import { logger } from '@/logger';

const isProduction = process.env.NODE_ENV === 'production';

const config = {
    username: isProduction
        ? process.env.MYSQL_PROD_USER
        : process.env.MYSQL_USER,
    password: isProduction
        ? process.env.MYSQL_PROD_PASSWORD
        : process.env.MYSQL_PASSWORD,
    database: isProduction
        ? process.env.MYSQL_PROD_DATABASE
        : process.env.MYSQL_DATABASE,
    host: isProduction ? process.env.MYSQL_PROD_HOST : process.env.MYSQL_HOST,
    port: isProduction ? process.env.MYSQL_PROD_PORT : process.env.MYSQL_PORT,
    dialectOptions: isProduction
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: 'mysql',
        dialectOptions: config.dialectOptions,
        logging: false,
    }
);

sequelize
    .authenticate()
    .then(() => {
        logger.log('Connected to MySQL');
    })
    .catch((err: Error) => {
        logger.error('Unable to connect to the MySQL database:' + err);
        process.exit(1);
    });

export default sequelize;
