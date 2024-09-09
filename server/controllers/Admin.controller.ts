import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { User, Admin } from '../models/relational';

export const getAdmins = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const admins = await Admin.findAll({
            include: {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'username', 'email'],
            },
        });

        res.status(200).json({ admins });
    } catch (err) {
        console.log('Error getting admins:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAdminByID = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    try {
        const admin = await Admin.findByPk(id, {
            include: {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'username', 'email'],
            },
        });

        res.status(200).json({ admin });
    } catch (error) {
        console.log('Error fetching admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createAdmin = async (
    req: Request,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const { firstName, lastName, username, email, password, role } =
            req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAdmin = await Admin.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            role,
        });

        res.status(201).json({ newAdmin });
    } catch (err) {
        console.error('Error creating admin: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateAdmin = async (
    req: Request,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const id = parseInt(req.params.id, 10);
        const { firstName, lastName, username, email, password, role } =
            req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const updated = await Admin.update(
            {
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                role,
            },
            { where: { id }, returning: true }
        );

        if (updated) {
            const updatedAdmin = await Admin.findByPk(id);
            res.json({ updatedAdmin });
        } else {
            res.status(404).json({ error: 'Admin not found' });
        }
    } catch (err) {
        console.error('Error updating admin: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteAdmin = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const admin = await Admin.findByPk(id);
        if (!admin) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }

        // Find the associated user
        const user = await User.findByPk(admin.userId);

        // Delete the admin
        await admin.destroy();

        // Soft delete the associated user
        if (user) {
            await user.destroy(); // This triggers the soft delete and sets `deletedAt`
        }

        res.status(200).json({
            message: 'Admin and associated user deleted (soft delete for user)',
        });
    } catch (err) {
        console.error('Error deleting admin: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const checkAvailability = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { username, email } = req.query;

    // Determine the field to check
    const field = username ? 'username' : email ? 'email' : null;

    if (!field) {
        res.status(400).json({ message: 'Username or Email is required' });
        return;
    }

    try {
        const adminExists = await Admin.findOne({
            where: { [field]: req.query[field] },
        });

        if (adminExists) {
            res.status(200).json({
                available: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} is taken`,
            });
        } else {
            res.status(200).json({
                available: true,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} is available`,
            });
        }
    } catch (error) {
        console.error(`Error checking ${field} availability:`, error);
        res.status(500).json({ message: 'Server error' });
    }
};
