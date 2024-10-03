import { Request, Response } from 'express';
import {
    UserService,
    NotificationService,
    AdminLogsService,
} from '../services';
import {
    UserNotFoundError,
    UserAlreadyExistsError,
    InvalidCredentialsError,
    InvalidUserTypeError,
    InvalidAdminRoleError,
} from '../errors';

export class UserController {
    private userService: UserService;
    private notificationService: NotificationService;
    private adminLogsService: AdminLogsService;

    constructor(
        userService: UserService,
        notificationService: NotificationService,
        AdminLogsService: AdminLogsService
    ) {
        this.userService = userService;
        this.notificationService = notificationService;
        this.adminLogsService = AdminLogsService;
    }

    public async registerCustomer(req: Request, res: Response): Promise<void> {
        const { details } = req.body;

        try {
            const newCustomer =
                await this.userService.registerCustomer(details);

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
                res.status(403).json({ message: 'Customer already exists' });
                return;
            }

            console.error('Error registering customer:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async registerAdmin(req: Request, res: Response): Promise<void> {
        const { details } = req.body;

        try {
            const newAdmin = await this.userService.registerAdmin(details);
            res.status(201).json({ newAdmin });

            await this.adminLogsService.log(
                details.username,
                'admin',
                'create'
            );
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                console.error('Error registering admin:', err);
                res.status(403).json({ message: 'Admin already exists' });
                return;
            }

            console.error('Error registering admin:', err);
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
            res.status(200).json({ customer });
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                console.error(
                    'Error adding shipping details to customer: ',
                    err
                );
                res.status(403).json({ message: 'Customer not found' });
                return;
            }

            console.error('Error adding shipping details to customer: ', err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllCustomers(_req: Request, res: Response): Promise<void> {
        try {
            const customers = this.userService.getAllCustomers();
            res.status(200).json({ customers });
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
            const customer = await this.userService.findCustomerByAttribute(
                attribute as string,
                value as string | number
            );
            res.status(200).json({ customer });
        } catch (error) {
            console.error('Error retrieving customer by attribute: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerById(req: Request, res: Response): Promise<void> {
        const customerId = Number(req.params.id);

        try {
            const customer = await this.userService.getCustomerById(customerId);
            res.status(200).json({ customer });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error retrieving customer by ID: ', error);
                res.status(401).json({ message: 'Customer not found' });
                return;
            }

            console.error('Error retrieving customer by ID: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllAdmins(_req: Request, res: Response): Promise<void> {
        try {
            const admins = await this.userService.getAllAdmins();
            res.status(200).json({ admins });
        } catch (error) {
            console.error('Error retrieving admins: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAdminById(req: Request, res: Response): Promise<void> {
        const adminId = Number(req.params.id);

        try {
            const admin = await this.userService.getAdminById(adminId);
            res.status(200).json({ admin });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error retrieving admin by ID: ', error);
                res.status(401).json({ message: 'admin not found' });
                return;
            }

            console.error('Error retrieving admin by ID: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAdminsByRole(req: Request, res: Response): Promise<void> {
        const role: string = req.query.role as string;

        try {
            const admins = await this.userService.getAdminsByRole(role);
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

    public async checkUserAvailability(
        req: Request,
        res: Response
    ): Promise<void> {
        const { username, email } = req.query;

        const field: string | null = username
            ? 'username'
            : email
              ? 'email'
              : null;

        if (!field) {
            res.status(400).json({ message: 'Username or Email is required' });
            return;
        }

        try {
            const response = await this.userService.checkUserAvailability(
                field,
                req.query[field] as string
            );

            res.status(200).json({ response });
        } catch (error) {
            console.error(`Error checking ${field} availability: `, error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateUser(req: Request, res: Response): Promise<void> {
        const userId: number = Number(req.params.id);
        const details = req.body;

        try {
            const user = await this.userService.updateUser(userId, details);
            res.status(201).json({ user });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error updating user: ', error);
                res.status(404).json({ message: 'User not found' });
                return;
            }

            console.error('Error updating user: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async changePassword(req: Request, res: Response): Promise<void> {
        const userId: number = Number(req.params.id);
        const { oldPassword, newPassword } = req.body;

        try {
            await this.userService.changePassword(
                userId,
                oldPassword,
                newPassword
            );
            res.status(201).json({ message: 'Password changed successfully' });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error changing password: ', error);
                res.status(404).json({ message: 'User not found' });
                return;
            }

            console.error('Error changing password: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async setAdminRole(req: Request, res: Response): Promise<void> {
        const userId: number = Number(req.params.id);
        const { username, roleNumber } = req.body;

        try {
            await this.userService.setAdminRole(userId, roleNumber);
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

    public async removeShippingDetails(
        req: Request,
        res: Response
    ): Promise<void> {
        const customerId: number = Number(req.params.id);

        try {
            await this.userService.removeShippingDetails(customerId);
            res.status(200).json({
                message: 'Shipping details removed successfully',
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error removing shipping details: ', error);
                res.status(404).json({ message: 'Customer not found' });
                return;
            }

            console.error('Error removing shipping details: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<void> {
        const userId: number = Number(req.params.id);
        const { username } = req.body;

        try {
            await this.userService.deleteUser(userId);
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

    public async signUpUser(req: Request, res: Response): Promise<void> {
        const { userType, details } = req.body;

        try {
            const { refreshToken, accessToken } =
                await this.userService.signUpUser(userType, details);

            await this.notificationService.sendWelcomeEmail(
                details.firstName,
                details.email
            ); // Method call above the response for development purposes
            res.status(201).json({
                message: 'User signed up successfully',
                refreshToken,
                accessToken,
            });
        } catch (error) {
            if (error instanceof InvalidUserTypeError) {
                console.error('Error signing up user: ', error);
                res.status(400).json({ message: 'Invalid user type' });
                return;
            }

            console.error('Error signing up user: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async loginUser(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        try {
            const { refreshToken, accessToken } =
                await this.userService.loginUser(username, password);
            res.status(200).json({
                message: 'User logged in successfully',
                refreshToken,
                accessToken,
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error logging in user: ', error);
                res.status(404).json({ message: 'User not found' });
                return;
            }

            if (error instanceof InvalidCredentialsError) {
                console.error('Error logging in user: ', error);
                res.status(400).json({ message: 'Invalid password' });
                return;
            }

            console.error('Error logging in user: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
