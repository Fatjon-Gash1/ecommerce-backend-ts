import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { User, Customer, Admin } from '../models/relational';
import type { ModelStatic, Model } from 'sequelize';
import {
    UserNotFoundError,
    UserAlreadyExistsError,
    InvalidCredentialsError,
    InvalidUserTypeError,
    InvalidAdminRoleError,
} from '../errors';
const {
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
} = process.env;

interface UserDetails {
    profilePictureUrl?: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
}

interface UserCreationDetails extends UserDetails {
    password: string;
}

interface CustomerShippingDetails {
    streetAndHouseNumber: string;
    postalCode: string;
    city: string;
    country: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

enum AdminRoles {
    SUPER_ADMIN = 'super_admin',
    MANAGER = 'manager',
}

/**
 * Service responsible for user-related operations.
 */
export class UserService {
    /**
     * Registers a provided user type in the database.
     *
     * @remarks
     * This is a generic method that will be used by utility methods below.
     *
     * @param userType - The type of user to register
     * @param details - The details of the user to register
     * @returns A promise resolving to the created user
     *
     * @throws {@link UserAlreadyExistsError}
     * Thrown if the user already exists.
     */
    public async registerUser<T extends Model>(
        userType: ModelStatic<T>,
        details: UserCreationDetails
    ): Promise<T> {
        const user = await User.findOne({
            where: { username: details.username },
        });
        if (user) {
            throw new UserAlreadyExistsError();
        } else {
            return await userType.create(details as T['_creationAttributes']);
        }
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
     * Adds/changes shipping details to a Customer.
     *
     * @param customerId - The ID of the Customer
     * @param details - The shipping details
     * @returns A promise resolving to the updated Customer
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the Customer is not found.
     *
     * @throws {@link Error}
     * Thrown if it fails to save the Customer's shipping details.
     */
    public async addShippingDetails(
        customerId: number,
        details: CustomerShippingDetails
    ): Promise<Customer> {
        const { streetAndHouseNumber, postalCode, city, country } = details;
        if (!/\d$/.test(streetAndHouseNumber)) {
            throw new Error('Street and house number must end with a number');
        }

        const customer = await Customer.findByPk(customerId);

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        customer.shippingAddress = `${streetAndHouseNumber}, ${postalCode} ${city}, ${country}`;

        return await customer.save();
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
     * Retrieves Customer by ID.
     *
     * @param customerId - The ID of the Customer
     * @returns A promise resolving to a Customer instance
     */
    public async getCustomerById(customerId: number): Promise<Customer> {
        const customer = await Customer.findByPk(customerId, { include: User });

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        return customer;
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
     * Checks user availability.
     *
     * @param userField - The field to check
     * @param value - The value of the field
     * @returns A promise resolving to an object containing a boolean and a message
     */
    public async checkUserAvailability(
        userField: string,
        value: string
    ): Promise<{ available: boolean; message: string }> {
        const user = await User.findOne({ where: { [userField]: value } });

        if (user) {
            return {
                available: false,
                message: `${userField.charAt(0).toUpperCase() + userField.slice(1)} is taken. Please choose another ${userField}.`,
            };
        }

        return {
            available: true,
            message: `${userField.charAt(0).toUpperCase() + userField.slice(1)} is available`,
        };
    }

    /**
     * Updates a user in the database.
     *
     * @param userId - The ID of the user to update
     * @param details - The details of the user to update
     * @returns A promise resolving to the updated user
     * @throws UserNotFoundError if the user is not found
     */
    public async updateUser(
        userId: number,
        details: UserDetails
    ): Promise<User> {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        return await user.update(details);
    }

    /**
     * Changes a user's password.
     *
     * @param userId - The ID of the user to update
     * @param oldPassword - The old password
     * @param newPassword - The new password
     * @throws UserNotFoundError if the user is not found
     */
    public async changePassword(
        userId: number,
        oldPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        const valid = await user.validatePassword(oldPassword);

        if (valid) {
            await user.hashAndStorePassword(newPassword);
            await user.save();
        } else {
            throw new InvalidCredentialsError();
        }
    }

    // A forgot password method should be implemented here.

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

    /**
     * Removes the customer's shipping details.
     *
     * @param customerId - The ID of the customer
     * @throws UserNotFoundError if the customer is not found
     */
    public async removeShippingDetails(customerId: number): Promise<void> {
        const customer = await Customer.findByPk(customerId);

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        customer.shippingAddress = 'none';

        await customer.save();
    }

    /**
     * Deletes a user from the database.
     *
     * @param userId - The ID of the user to delete
     * @throws UserNotFoundError if the user is not found
     */
    public async deleteUser(userId: number): Promise<void> {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        await user.destroy();
    }

    /**
     * Signs-Up a new user of given type in the platform.
     *
     * @param details - The details of the user to sign-up
     * @returns A promise resolving to an object containing access and refresh tokens
     * @throws {@link UserAlreadyExistsError}
     * Thrown if the user already exists.
     */
    public async signUpUser(
        userType: string = 'customer',
        details: UserCreationDetails
    ): Promise<AuthTokens> {
        const type = userType.toLowerCase();
        let registeredUser = null;

        if (type === 'admin') {
            registeredUser = await this.registerAdmin(details);
        } else if (type === 'customer') {
            registeredUser = await this.registerCustomer(details);
        } else {
            throw new InvalidUserTypeError();
        }

        // Generate refresh token
        const refreshToken = jwt.sign(
            { userId: registeredUser.id, username: registeredUser.username },
            REFRESH_TOKEN_KEY!,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        // Generate access token
        const accessToken = jwt.sign(
            { userId: registeredUser.id, username: registeredUser.username },
            ACCESS_TOKEN_KEY!,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        return { refreshToken, accessToken };
    }

    /**
     * Logins a user and returns access and refresh tokens.
     *
     * @param username - The username of the user
     * @param password - The password of the user
     * @returns A promise resolving to an object containing access and refresh tokens
     * @throws UserNotFoundError if the user is not found
     * @throws InvalidCredentialsError if the password is invalid
     */
    public async loginUser(
        username: string,
        password: string
    ): Promise<AuthTokens> {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            throw new UserNotFoundError();
        }

        const isPasswordValid = await user.validatePassword(password);

        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        // Generate refresh token
        const refreshToken = jwt.sign(
            { userId: user.id, username },
            REFRESH_TOKEN_KEY!,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        // Generate access token
        const accessToken = jwt.sign(
            { userId: user.id, username },
            ACCESS_TOKEN_KEY!,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        return { refreshToken, accessToken };
    }
}
