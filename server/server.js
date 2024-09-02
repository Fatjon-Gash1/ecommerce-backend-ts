require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const { sequelize, mongoose } = require('./config/db'); // Import database configurations
const User = require('./models/user.model');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Sync the Sequelize models with the database
sequelize
    .sync()
    .then(() => {
        console.log('Sequelize models synced with database');
    })
    .catch((err) => {
        console.error('Error syncing Sequelize models:', err);
    });

// Use the routes defined in the routes directory
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
