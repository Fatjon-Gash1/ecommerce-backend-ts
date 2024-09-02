const sequelize = require('./mysql'); // Import the Sequelize instance for MySQL
const mongoose = require('./mongodb'); // Assuming MongoDB setup is in mongodb.js

module.exports = {
    sequelize,
    mongoose,
};
