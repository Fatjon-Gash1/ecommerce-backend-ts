import { Request, Response } from 'express';
import {
    AdminService,
    NotificationService,
    AdminLogsService,
} from '../services';
import {
    UserNotFoundError,
    UserAlreadyExistsError,
    InvalidAdminRoleError,
} from '../errors';

export class AdminController {
    private adminService: AdminService;
    private notificationService: NotificationService;
    private adminLogsService: AdminLogsService;

    constructor(
        adminService: AdminService,
        notificationService: NotificationService,
        AdminLogsService: AdminLogsService
    ) {
        this.adminService = adminService;
        this.notificationService = notificationService;
        this.adminLogsService = AdminLogsService;
    }

    public async registerCustomer(req: Request, res: Response): Promise<void> {
        const { details } = req.body;

        try {
            const newCustomer =
                await this.adminService.registerCustomer(details);

            await this.notificationService.sendWelcomeEmail(
                details.firstName,
                details.email
            ); // Method call above the response for development purposes

            res.status(201).json({ newCustomer });

            await this.adminLogsService.log(
                details.username,
                'customer',
                'create'
            );
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                console.error('Error registering customer:', err);
                res.status(409).json({ message: 'Customer already exists' });
                return;
            }

            console.error('Error registering customer:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async registerAdmin(req: Request, res: Response): Promise<void> {
        const { details } = req.body;

        try {
            const newAdmin = await this.adminService.registerAdmin(details);
            res.status(201).json({ newAdmin });

            await this.adminLogsService.log(
                details.username,
                'admin',
                'create'
            );
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                console.error('Error registering admin:', err);
                res.status(409).json({ message: 'Admin already exists' });
                return;
            }

            console.error('Error registering admin:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerById(req: Request, res: Response): Promise<void> {
        const customerId = Number(req.params.id);

        try {
            const customer =
                await this.adminService.getCustomerById(customerId);
            res.status(200).json({ customer });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error retrieving customer by ID: ', error);
                res.status(404).json({ message: 'Customer not found' });
                return;
            }

            console.error('Error retrieving customer by ID: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async findActiveCustomers(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const activeCustomers = this.adminService.findActiveCustomers();
            res.status(200).json({ activeCustomers });
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
            const customer = await this.adminService.findCustomerByAttribute(
                attribute as string,
                value as string | number
            );
            res.status(200).json({ customer });
        } catch (error) {
            console.error('Error retrieving customer by attribute: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllCustomers(_req: Request, res: Response): Promise<void> {
        try {
            const customers = this.adminService.getAllCustomers();
            res.status(200).json({ customers });
        } catch (error) {
            console.error('Error retrieving customers: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAdminById(req: Request, res: Response): Promise<void> {
        const adminId = Number(req.params.id);

        try {
            const admin = await this.adminService.getAdminById(adminId);
            res.status(200).json({ admin });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error retrieving admin by ID: ', error);
                res.status(404).json({ message: 'admin not found' });
                return;
            }

            console.error('Error retrieving admin by ID: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAdminsByRole(req: Request, res: Response): Promise<void> {
        const { role } = req.query;

        try {
            const admins = await this.adminService.getAdminsByRole(
                role! as string
            );
            res.status(200).json({ admins });
        } catch (error) {
            if (error instanceof InvalidAdminRoleError) {
                console.error('Error retrieving admins by role: ', error);
                res.status(400).json({ message: 'Invalid role' });
                return;
            }

            console.error('Error retrieving admins by role: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllAdmins(_req: Request, res: Response): Promise<void> {
        try {
            const admins = await this.adminService.getAllAdmins();
            res.status(200).json({ admins });
        } catch (error) {
            console.error('Error retrieving admins: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async setAdminRole(req: Request, res: Response): Promise<void> {
        const userId: number = Number(req.params.id);
        const { username, roleNumber } = req.body;

        try {
            await this.adminService.setAdminRole(userId, roleNumber);
            res.status(201).json({ message: 'Admin role set successfully' });

            await this.adminLogsService.log(username, 'admin', 'update');
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error setting admin role: ', error);
                res.status(404).json({ message: 'Admin not found' });
                return;
            }

            console.error('Error setting admin role: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<void> {
        const userId: number = Number(req.params.id);
        const { username } = req.body;

        try {
            await this.adminService.deleteUser(userId);
            res.status(200).json({ message: 'User deleted successfully' });

            await this.adminLogsService.log(username, 'admin', 'delete');
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error deleting user: ', error);
                res.status(404).json({ message: 'User not found' });
                return;
            }

            console.error('Error deleting user: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
