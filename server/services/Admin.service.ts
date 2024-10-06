import { UserService, UserCreationDetails } from './User.service';
import { User, Customer, Admin } from '../models/relational';
import { UserNotFoundError, InvalidAdminRoleError } from '../errors';

enum AdminRoles {
    SUPER_ADMIN = 'super_admin',
    MANAGER = 'manager',
}

/**
 * Service responsible for Admin-related operations.
 */
export class AdminService extends UserService {
    /**
     * Registers a user as a Customer.
     *
     * @param details - The details of the user to register
     * @returns A promise resolving to a Customer user instance
     */
    public async registerCustomer(
        details: UserCreationDetails
    ): Promise<Customer> {
        return this.registerUser(Customer, details);
    }

    /**
     * Registers a user as an Admin.
     *
     * @param details - The details of the user to register
     * @returns A promise resolving to an Admin user instance
     */
    public async registerAdmin(details: UserCreationDetails): Promise<Admin> {
        return this.registerUser(Admin, details);
    }

    /**
     * Retrieves active Customers from the database.
     *
     * @returns A promise resolving to an array of active Customer instances
     */
    public async findActiveCustomers(): Promise<Customer[]> {
        const activeCustomers = await Customer.findAll({
            where: { isActive: true },
            include: User,
        });

        return activeCustomers;
    }

    /**
     * Retrieves a specific Customer from the provided attribute.
     *
     * @param attribute - The attribute to search for
     * @param attributeValue - The value of the attribute
     * @returns A promise resolving to a Customer instance
     */
    public async findCustomerByAttribute(
        attribute: string,
        attributeValue: string | number
    ): Promise<Customer> {
        const whereCondition: { [key: string]: string | number } = {};

        if (attribute && attributeValue) {
            whereCondition[attribute] = attributeValue;
        }

        const customer = await Customer.findOne({
            include: {
                model: User,
                as: 'User',
                where: whereCondition,
            },
        });

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        return customer;
    }

    /**
     * Retrieves all Customers in the database.
     *
     * @returns A promise resolving to an array of Customer instances
     */
    public async getAllCustomers(): Promise<Customer[]> {
        const users = await Customer.findAll({ include: User });

        return users;
    }

    /**
     * Retrieves Admin by ID.
     *
     * @param adminId - The ID of the Admin
     * @returns A promise resolving to a Admin instance
     */
    public async getAdminById(adminId: number): Promise<Admin> {
        const admin = await Admin.findByPk(adminId, { include: User });

        if (!admin) {
            throw new UserNotFoundError('User of type Admin not found');
        }

        return admin;
    }

    /**
     * Retrieves Admins by role.
     *
     * @param role - The role of the Admins
     * @returns A promise resolving to an Admin instance array
     */
    public async getAdminsByRole(role: string): Promise<Admin[]> {
        role = role.toLowerCase();

        const validRoles: Record<string, string> = {
            'super admin': AdminRoles.SUPER_ADMIN,
            manager: AdminRoles.MANAGER,
        };

        if (!validRoles[role]) {
            throw new InvalidAdminRoleError();
        }

        const admins = await Admin.findAll({
            where: { role: validRoles[role] },
            include: User,
        });

        return admins;
    }

    /**
     * Retrieves all Admins in the database.
     *
     * @returns A promise resolving to an array of Admin instances
     */
    public async getAllAdmins(): Promise<Admin[]> {
        const users = await Admin.findAll({ include: User });

        return users;
    }

    /**
     * Sets admin user role from the provided role number.
     *
     * @param userId - The ID of the user
     * @param roleNumber - The role number of the user
     * @throws UserNotFoundError if the user is not found
     */
    public async setAdminRole(
        userId: number,
        roleNumber: number
    ): Promise<void> {
        const admin = await Admin.findOne({ where: { userId } });

        if (!admin) {
            throw new UserNotFoundError(
                'No admin found with user id: ' + userId
            );
        }

        await admin.setRole(roleNumber);
    }
}
