require('dotenv').config();

const User = require('../models/user.model');

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
    try {
        const { username, email, password } = req.body;
        const newUser = await User.create({ username, email, password });
        res.status(201).json({ newUser });
    } catch (err) {
        console.error('Error creating user: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { username, email, password } = req.body;
        const updated = await User.update(
            { username, email, password },
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

module.exports = {
    getUsers,
    getUserByID,
    createUser,
    updateUser,
    deleteUser,
};
