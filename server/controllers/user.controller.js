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
        const userFields = req.body;

        for (let x in userFields) {
            if (userFields[x] === '') {
                res.status(400).json({ message: 'Please fill all fields' });
                return;
            }
        }

        const { firstName, lastName, username, email, password } = userFields;
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            password,
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

const checkUsername = async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const userExists = await User.findOne({ where: { username } });

        if (userExists) {
            return res
                .status(200)
                .json({ available: false, message: 'Username is taken' });
        } else {
            return res
                .status(200)
                .json({ available: true, message: 'Username is available' });
        }
    } catch (error) {
        console.error('Error checking username availability:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
const checkEmail = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res
                .status(200)
                .json({ available: false, message: 'Email is taken' });
        } else {
            return res
                .status(200)
                .json({ available: true, message: 'Email is available' });
        }
    } catch (error) {
        console.error('Error checking email availability:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getUserByID,
    createUser,
    updateUser,
    deleteUser,
    checkUsername,
    checkEmail,
};
