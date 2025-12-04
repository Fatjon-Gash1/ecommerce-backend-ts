import { UserService } from './User.service';
import {
    User,
    Customer,
    Admin,
    SupportAgent,
    SupportTicket,
    Courier,
    Order,
} from '@/models/relational';
import { UserNotFoundError } from '@/errors';
import {
    UserCreationDetails,
    CustomerResponse,
    AdminResponse,
    SupportAgentResponse,
    CourierResponse,
} from '@/types';
import sequelize, { Sequelize } from 'sequelize';

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
        const newCustomer = await this.userFactory(Customer, details);
        newCustomer.stripeId = await this.paymentService!.createCustomer(
            `${newCustomer.firstName} ${newCustomer.lastName}`,
            newCustomer.email
        );
        await newCustomer.save();
    }

    /**
     * Registers a user as a Support Agent.
     *
     * @param details - The details of the user to register
     */
    public async registerSupportAgent(
        details: UserCreationDetails
    ): Promise<void> {
        const newSupportAgent = await this.userFactory(SupportAgent, details);
        await newSupportAgent.save();
    }

    /**
     * Registers a user as a Courier.
     *
     * @param details - The details of the user to register
     */
    public async registerCourier(details: UserCreationDetails): Promise<void> {
        const newCourier = await this.userFactory(Courier, details);
        await newCourier.save();
    }

    /**
     * Registers a user as an Admin.
     *
     * @param details - The details of the user to register
     */
    public async registerAdmin(details: UserCreationDetails): Promise<void> {
        const newAdmin = await this.userFactory(Admin, details);
        await newAdmin.save();
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
     * an array of Customer objects
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
     * Retrieves all Support Agents in the database.
     *
     * @returns A promise resolving to the total count along with
     * an array of Support Agent objects
     */
    public async getAllSupportAgents(): Promise<{
        count: number;
        supportAgents: SupportAgentResponse[];
    }> {
        const { count, rows } = await SupportAgent.findAndCountAll({
            attributes: { exclude: ['userId'] },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['id', 'password'] },
                },
                {
                    model: SupportTicket,
                    as: 'tickets',
                    attributes: [
                        [
                            sequelize.fn(
                                'AVG',
                                sequelize.col('initialResponseTime')
                            ),
                            'averageResponseTime',
                        ],
                        [
                            sequelize.fn(
                                'AVG',
                                sequelize.col('customerRating')
                            ),
                            'averageCustomerRating',
                        ],
                        [
                            sequelize.fn('COUNT', sequelize.col('tickets.id')),
                            'handledTickets',
                        ],
                        [
                            sequelize.literal(
                                `SUM(CASE WHEN tickets.status = 'resolved' THEN 1 ELSE 0 END)`
                            ),
                            'resolvedTickets',
                        ],
                        [
                            sequelize.literal(
                                `SUM(CASE WHEN tickets.status = 'failed' THEN 1 ELSE 0 END)`
                            ),
                            'failedTickets',
                        ],
                        [
                            sequelize.literal(
                                `SUM(CASE WHEN tickets.status = 'pending' THEN 1 ELSE 0 END)`
                            ),
                            'pendingTickets',
                        ],
                    ],
                },
            ],
        });

        const supportAgents = rows.map((row) => {
            const { user, ...rest } = row.toJSON();
            return { ...rest, ...user };
        });

        return { count, supportAgents };
    }

    /**
     * Retrieves all Couriers in the database.
     *
     * @returns A promise resolving to the total count along with the Courier objects
     */
    public async getAllCouriers(): Promise<{
        count: number;
        couriers: CourierResponse[];
    }> {
        const { count, rows } = await Courier.findAndCountAll({
            attributes: { exclude: ['userId'] },
            include: {
                model: User,
                as: 'user',
                attributes: { exclude: ['id', 'password'] },
            },
        });

        const aggregates = await Order.findAll({
            attributes: [
                'courierId',
                [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
                [
                    Sequelize.literal(
                        `SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END)`
                    ),
                    'shippedOrders',
                ],
                [
                    Sequelize.literal(
                        `SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`
                    ),
                    'deliveredOrders',
                ],
            ],
            group: ['courierId'],
            raw: true,
        });

        for (let i = 0; i < rows.length; i++) {
            rows[i].setDataValue(
                'averageCustomerRating',
                aggregates[i].averageRating
            );
            rows[i].setDataValue('shippedOrders', aggregates[i].shippedOrders);
            rows[i].setDataValue(
                'deliveredOrders',
                aggregates[i].deliveredOrders
            );
        }

        const couriers = rows.map((row) => {
            const { user, ...rest } = row.toJSON();
            return { ...rest, ...user };
        });

        return { count, couriers };
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
     * Retrieves Admin by ID.
     *
     * @param adminId - The id of the Admin
     * @returns A promise resolving to an Admin object
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
