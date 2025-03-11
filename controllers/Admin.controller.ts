import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import {
    AdminService,
    AdminLogsService,
    PlatformDataService,
    LoggerService,
} from '@/services';
import { UserNotFoundError, UserAlreadyExistsError } from '@/errors';

export class AdminController {
    private adminService: AdminService;
    private adminLogsService: AdminLogsService;
    private platformDataService: PlatformDataService;
    private logger: LoggerService;

    constructor(
        adminService: AdminService,
        AdminLogsService: AdminLogsService,
        platformDataService: PlatformDataService
    ) {
        this.adminService = adminService;
        this.adminLogsService = AdminLogsService;
        this.platformDataService = platformDataService;
        this.logger = new LoggerService();
    }

    public async registerCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;
        const { details } = req.body;

        try {
            await this.adminService.registerCustomer(details);

            res.status(201).json({
                message: 'Customer registered successfully',
            });

            await this.adminLogsService.log(username, 'customer', 'create');
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                this.logger.error('Error registering customer:' + err);
                return res
                    .status(409)
                    .json({ message: 'Customer already exists' });
            }

            this.logger.error('Error registering customer:' + err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async registerAdmin(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;
        const { details } = req.body;

        try {
            await this.adminService.registerAdmin(details);
            res.status(201).json({ message: 'Admin registered successfully' });

            await this.adminLogsService.log(username, 'admin', 'create');
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                this.logger.error('Error registering admin:' + err);
                return res
                    .status(409)
                    .json({ message: 'Admin already exists' });
            }

            this.logger.error('Error registering admin:' + err);
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
                this.logger.error('Error retrieving customer by ID: ' + error);
                return res.status(404).json({ message: 'Customer not found' });
            }

            this.logger.error('Error retrieving customer by ID: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async findActiveCustomers(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const { count, customers } =
                await this.adminService.findActiveCustomers();
            return res.status(200).json({ total: count, customers });
        } catch (error) {
            this.logger.error('Error retrieving customers: ' + error);
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
            if (error instanceof UserNotFoundError) {
                this.logger.error(
                    'Error retrieving customer by attribute: ' + error
                );
                return res.status(404).json({ message: error.message });
            }
            this.logger.error(
                'Error retrieving customer by attribute: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllCustomers(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const { count, customers } =
                await this.adminService.getAllCustomers();
            return res.status(200).json({ total: count, customers });
        } catch (error) {
            this.logger.error('Error retrieving customers: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAdminById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const adminId: number = Number(req.params.id);

        try {
            const admin = await this.adminService.getAdminById(adminId);
            return res.status(200).json({ admin });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error retrieving admin by ID: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error retrieving admin by ID: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAdminsByRole(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { role } = req.query;

        try {
            const { count, admins } = await this.adminService.getAllAdmins(
                role as string
            );
            return res.status(200).json({ total: count, admins });
        } catch (error) {
            this.logger.error('Error retrieving admins by role: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllAdmins(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const { count, admins } = await this.adminService.getAllAdmins();
            return res.status(200).json({ total: count, admins });
        } catch (error) {
            this.logger.error('Error retrieving admins: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPlatformData(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const platformData =
                await this.platformDataService.getPlatformData();
            return res.status(200).json({ platformData });
        } catch (error) {
            this.logger.error('Error retrieving platform data: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async setAdminRole(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const adminId: number = Number(req.params.adminId);
        const { username } = req.user as JwtPayload;
        const { role } = req.body;

        try {
            await this.adminService.setAdminRole(adminId, role);
            res.status(200).json({ message: 'Admin role set successfully' });

            await this.adminLogsService.log(username, 'admin', 'update');
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error setting admin role: ' + error);
                return res.status(404).json({ message: 'Admin not found' });
            }

            this.logger.error('Error setting admin role: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updatePlatformData(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const id = req.params.id;
        const data = req.body;

        try {
            const updatedData =
                await this.platformDataService.updatePlatformData(id, data);
            return res.status(200).json({
                message: 'Platform data updated successfully',
                data: updatedData,
            });
        } catch (error) {
            this.logger.error('Error updating platform data:' + error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    public async deleteUserById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const userId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;

        try {
            await this.adminService.deleteUser(userId);
            res.sendStatus(204);

            await this.adminLogsService.log(username, 'admin', 'delete');
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error deleting user: ' + error);
                return res.status(404).json({ message: 'User not found' });
            }

            this.logger.error('Error deleting user: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
