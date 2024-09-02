const { Sequelize } = require('sequelize');

// Create a new Sequelize instance for MySQL
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false, // Set to true to see SQL logs in the console
    }
);

// Test the connection
sequelize
    .authenticate()
    .then(() => {
        console.log('Connection to MySQL has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the MySQL database:', err);
        process.exit(1);
    });

module.exports = sequelize;
