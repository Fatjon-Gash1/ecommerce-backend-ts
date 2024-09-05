const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Additional user routes
router.get('/check-availability', userController.checkAvailability);

// Define CRUD user routes
router.get('/', userController.getUsers);

router.get('/:id', userController.getUserByID);

router.post('/', userController.createUser);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

module.exports = router;
