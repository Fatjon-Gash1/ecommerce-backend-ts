require('dotenv').config();

const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({ users });
    } catch (err) {
        console.log('Error getting users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserByID = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findByPk(id);
        res.status(200).json({ user });
    } catch (error) {
        console.log('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { firstName, lastName, username, email, password } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ newUser });
    } catch (err) {
        console.error('Error creating user: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { firstName, lastName, username, email, password } = req.body;
        const updated = await User.update(
            { firstName, lastName, username, email, password },
            { where: { id }, returning: true }
        );

        if (updated) {
            const updatedUser = await User.findByPk(id);
            res.json({ updatedUser });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error updating user: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await User.destroy({ where: { id } });

        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error deleting user: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const checkAvailability = async (req, res) => {
    const { username, email } = req.query;

    // Determine the field to check
    const field = username ? 'username' : email ? 'email' : null;

    if (!field) {
        return res
            .status(400)
            .json({ message: 'Username or Email is required' });
    }

    try {
        const userExists = await User.findOne({
            where: { [field]: req.query[field] },
        });

        if (userExists) {
            return res.status(200).json({
                available: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} is taken`,
            });
        } else {
            return res.status(200).json({
                available: true,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} is available`,
            });
        }
    } catch (error) {
        console.error(`Error checking ${field} availability:`, error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getUserByID,
    createUser,
    updateUser,
    deleteUser,
    checkAvailability,
};
