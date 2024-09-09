const express = require('express');
const router = express.Router();

// Default route
router.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Import and use user routes
const userRoutes = require('./users');
router.use('/users', userRoutes);

module.exports = router;
