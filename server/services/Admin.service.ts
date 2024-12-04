import {
    UserService,
    UserCreationDetails,
    CustomerResponse,
} from './User.service';
import { User, Customer, Admin } from '../models/relational';
import { UserNotFoundError } from '../errors';

interface AdminResponse {
    id?: number;
    role?: 'admin' | 'manager';
    createdAt?: Date;
    profilePictureUrl?: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
}

/**
 * Service responsible for Admin-related operations.
 */
export class AdminService extends UserService {
    /**
     * Registers a user as a Customer.
     *
     * @param details - The details of the user to register
     */
    public async registerCustomer(details: UserCreationDetails): Promise<void> {
        await this.registerUser(Customer, details);
    }

    /**
     * Registers a user as an Admin.
     *
     * @param details - The details of the user to register
     */
    public async registerAdmin(details: UserCreationDetails): Promise<void> {
        await this.registerUser(Admin, details);
    }

    /**
     * Retrieves active Customers from the database.
     *
     * @returns A promise resolving to an array of active Customer instances
     */
    public async findActiveCustomers(): Promise<{
        count: number;
        customers: CustomerResponse[];
    }> {
        const { count, rows } = await Customer.findAndCountAll({
            where: { isActive: true },
            attributes: { exclude: ['userId', 'updatedAt'] },
            include: {
                model: User,
                as: 'user',
                attributes: { exclude: ['password', 'updatedAt'] },
            },
        });

        const customers = rows.map((row) => {
            const { user, ...rest } = row.toJSON();
            return { ...rest, ...user };
        });

        return { count, customers };
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
    ): Promise<CustomerResponse> {
        const whereCondition: { [key: string]: string | number } = {};

        whereCondition[attribute] = attributeValue;

        const customer = await Customer.findOne({
            attributes: { exclude: ['userId', 'updatedAt'] },
            include: {
                model: User,
                as: 'user',
                where: whereCondition,
                attributes: { exclude: ['password', 'updatedAt'] },
            },
        });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const { user, ...rest } = customer.toJSON();

        return { ...rest, ...user };
    }

    /**
     * Retrieves all Customers in the database.
     *
     * @returns A promise resolving to the total count along with
     * an array of Customer instances
     */
    public async getAllCustomers(): Promise<{
        count: number;
        customers: CustomerResponse[];
    }> {
        const { count, rows } = await Customer.findAndCountAll({
            attributes: { exclude: ['userId', 'updatedAt'] },
            include: {
                model: User,
                as: 'user',
                attributes: { exclude: ['password', 'updatedAt'] },
            },
        });

        const customers = rows.map((row) => {
            const { user, ...rest } = row.toJSON();
            return { ...rest, ...user };
        });

        return { count, customers };
    }

    /**
     * Retrieves Admin by ID.
     *
     * @param adminId - The id of the Admin
     * @returns A promise resolving to an Admin instance
     */
    public async getAdminById(adminId: number): Promise<AdminResponse> {
        const admin = await Admin.findByPk(adminId, {
            attributes: { exclude: ['userId', 'updatedAt'] },
            include: {
                model: User,
                as: 'user',
                attributes: { exclude: ['id', 'password', 'updatedAt'] },
            },
        });

        if (!admin) {
            throw new UserNotFoundError('Admin not found');
        }

        const { user, ...rest } = admin.toJSON();

        return { ...rest, ...user };
    }

    /**
     * Retrieves all Admins && optionally filtered by role.
     *
     * @param role - The role of the Admins (optional)
     * @returns A promise resolving to an Admin instance array
     */
    public async getAllAdmins(
        role?: string
    ): Promise<{ count: number; admins: AdminResponse[] }> {
        const { count, rows } = await Admin.findAndCountAll({
            where: role ? { role } : {},
            attributes: { exclude: ['userId', 'updatedAt'] },
            include: {
                model: User,
                as: 'user',
                attributes: { exclude: ['id', 'password', 'updatedAt'] },
            },
        });

        const admins = rows.map((row) => {
            const { user, ...rest } = row.toJSON();
            return { ...rest, ...user };
        });

        return { count, admins };
    }

    /**
     * Sets admin role from the provided role number.
     *
     * @param adminId - The id of the Admin
     * @param role - The role number of the user
     * @throws UserNotFoundError if the user is not found
     */
    public async setAdminRole(adminId: number, role: number): Promise<void> {
        const admin = await Admin.findByPk(adminId);

        if (!admin) {
            throw new UserNotFoundError('Admin not found');
        }

        admin.role = role === 1 ? 'admin' : 'manager';
        await admin.save();
    }
}
