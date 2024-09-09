import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { User, Customer } from '../models/relational';

// Get all customers
export const getCustomers = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const customers = await Customer.findAll({
            include: {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'username', 'email'],
            },
        });

        res.status(200).json({ customers });
    } catch (err) {
        console.error('Error getting customers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get customer by ID
export const getCustomerByID = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    try {
        const customer = await Customer.findByPk(id, {
            include: {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'username', 'email'],
            },
        });

        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.status(200).json({ customer });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create new customer
export const createCustomer = async (
    req: Request,
    res: Response
): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            shippingAddress,
            billingAddress,
        } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newCustomer = await Customer.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            shippingAddress,
            billingAddress,
        });

        res.status(201).json({ newCustomer });
    } catch (err) {
        console.error('Error creating customer: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update customer
export const updateCustomer = async (
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
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            shippingAddress,
            billingAddress,
        } = req.body;

        const saltRounds = 10;
        const hashedPassword: string = await bcrypt.hash(password, saltRounds);

        const updated = await Customer.update(
            {
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                shippingAddress,
                billingAddress,
            },
            { where: { id }, returning: true }
        );

        if (updated) {
            const updatedCustomer = await Customer.findByPk(id);
            res.json({ updatedCustomer });
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (err) {
        console.error('Error updating customer: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete customer
export const deleteCustomer = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const customer = await Customer.findByPk(id);
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        // Find the associated user
        const user = await User.findByPk(customer.userId);

        // Delete the customer
        await customer.destroy();

        // Soft delete the associated user
        if (user) {
            await user.destroy(); // This triggers the soft delete and sets `deletedAt`
        }

        res.status(200).json({
            message:
                'Customer and associated user deleted (soft delete for user)',
        });
    } catch (err) {
        console.error('Error deleting customer: ', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Check availability of username or email
export const checkAvailability = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { username, email } = req.query;

    const field = username ? 'username' : email ? 'email' : null;

    if (!field) {
        res.status(400).json({ message: 'Username or Email is required' });
        return;
    }

    try {
        const customerExists = await Customer.findOne({
            where: { [field]: req.query[field] },
        });

        if (customerExists) {
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
