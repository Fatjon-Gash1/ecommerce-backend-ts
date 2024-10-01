import { Request, Response } from 'express';
import { UserService } from '../services';
import { UserAlreadyExistsError, UserNotFoundError } from '../errors';

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    public async registerCustomer(req: Request, res: Response): Promise<void> {
        try {
            const newCustomer = await this.userService.registerCustomer(
                req.body
            );
            res.status(201).json(newCustomer);
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                console.error('Error registering customer: ', err);
                res.status(403).json({ message: 'Customer already exists' });
            }
            console.error('Unknown error registering customer:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async registerAdmin(req: Request, res: Response): Promise<void> {
        try {
            const newAdmin = await this.userService.registerAdmin(req.body);
            res.status(201).json(newAdmin);
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                console.error('Error registering admin: ', err);
                res.status(403).json({ message: 'Admin already exists' });
            }
            console.error('Unknown error registering admin:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async addShippingDetailsToCustomer(
        req: Request,
        res: Response
    ): Promise<void> {
        const { customerId, details } = req.body;
        try {
            const customer =
                await this.userService.addShippingDetailsToCustomer(
                    customerId,
                    details
                );
            res.status(200).json(customer);
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                console.error(
                    'Error adding shipping details to customer: ',
                    err
                );
                res.status(403).json({ message: 'Customer not found' });
            }
            console.error('Error adding shipping details to customer: ', err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllCustomers(_req: Request, res: Response): Promise<void> {
        try {
            const customers = this.userService.getAllCustomers();
            res.status(200).json(customers);
        } catch (error) {
            console.error('Error retrieving customers: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async findActiveCustomers(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const activeCustomers = this.userService.findActiveCustomers();
            res.status(200).json(activeCustomers);
        } catch (error) {
            console.error('Error retrieving customers: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async findCustomerByAttribute(
        req: Request,
        res: Response
    ): Promise<void> {
        const { attribute, value } = req.query;
        try {
            const customer = await this.userService.findCustomerByAttribute(
                attribute as string,
                value as string | number
            );
            res.status(200).json(customer);
        } catch (error) {
            console.error('Error retrieving customer by attribute: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async checkAvailability(req: Request, res: Response): Promise<void> {
        const { username, email } = req.query;

        const field = username ? 'username' : email ? 'email' : null;

        if (!field) {
            res.status(400).json({ message: 'Username or Email is required' });
            return;
        }

        try {
            const response = await this.userService.checkUserAvailability(
                field,
                req.query[field] as string
            );

            res.status(200).json(response);
        } catch (error) {
            console.error(`Error checking ${field} availability: `, error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
