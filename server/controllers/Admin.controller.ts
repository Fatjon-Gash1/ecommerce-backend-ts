import { Request, Response } from 'express';
import {
    AdminService,
    NotificationService,
    AdminLogsService,
} from '../services';
import { UserNotFoundError, UserAlreadyExistsError } from '../errors';

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

    public async registerCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username, details } = req.body;

        try {
            const newCustomer =
                await this.adminService.registerCustomer(details);

            res.status(201).json({ newCustomer });

            await this.notificationService.sendWelcomeEmail(
                details.firstName,
                details.email
            );

            await this.adminLogsService.log(username, 'customer', 'create');
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                console.error('Error registering customer:', err);
                return res
                    .status(409)
                    .json({ message: 'Customer already exists' });
            }

            console.error('Error registering customer:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async registerAdmin(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username, details } = req.body;

        try {
            const newAdmin = await this.adminService.registerAdmin(details);
            res.status(201).json({ newAdmin });

            await this.adminLogsService.log(username, 'admin', 'create');
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                console.error('Error registering admin:', err);
                return res
                    .status(409)
                    .json({ message: 'Admin already exists' });
            }

            console.error('Error registering admin:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId = Number(req.params.id);

        try {
            const customer =
                await this.adminService.getCustomerById(customerId);
            return res.status(200).json({ customer });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error retrieving customer by ID: ', error);
                return res.status(404).json({ message: 'Customer not found' });
            }

            console.error('Error retrieving customer by ID: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async findActiveCustomers(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const activeCustomers = this.adminService.findActiveCustomers();
            return res.status(200).json({ activeCustomers });
        } catch (error) {
            console.error('Error retrieving customers: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async findCustomerByAttribute(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { attribute, value } = req.query;
        try {
            const customer = await this.adminService.findCustomerByAttribute(
                attribute as string,
                value as string | number
            );
            return res.status(200).json({ customer });
        } catch (error) {
            console.error('Error retrieving customer by attribute: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllCustomers(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const customers = this.adminService.getAllCustomers();
            return res.status(200).json({ customers });
        } catch (error) {
            console.error('Error retrieving customers: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAdminById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const adminId = Number(req.params.id);

        try {
            const admin = await this.adminService.getAdminById(adminId);
            return res.status(200).json({ admin });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error retrieving admin by ID: ', error);
                return res.status(404).json({ message: 'admin not found' });
            }

            console.error('Error retrieving admin by ID: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAdminsByRole(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { role } = req.query;

        try {
            const admins = await this.adminService.getAdminsByRole(
                role as string
            );
            return res.status(200).json({ admins });
        } catch (error) {
            console.error('Error retrieving admins by role: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllAdmins(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const admins = await this.adminService.getAllAdmins();
            return res.status(200).json({ admins });
        } catch (error) {
            console.error('Error retrieving admins: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async setAdminRole(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const userId: number = Number(req.params.id);
        const { username, roleNumber } = req.body;

        try {
            await this.adminService.setAdminRole(userId, roleNumber);
            res.status(201).json({ message: 'Admin role set successfully' });

            await this.adminLogsService.log(username, 'admin', 'update');
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error setting admin role: ', error);
                return res.status(404).json({ message: 'Admin not found' });
            }

            console.error('Error setting admin role: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteUserById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const userId: number = Number(req.params.id);
        const { username } = req.body;

        try {
            await this.adminService.deleteUser(userId);
            res.status(200).json({ message: 'User deleted successfully' });

            await this.adminLogsService.log(username, 'admin', 'delete');
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error deleting user: ', error);
                return res.status(404).json({ message: 'User not found' });
            }

            console.error('Error deleting user: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
