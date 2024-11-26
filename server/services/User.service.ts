import jwt from 'jsonwebtoken';
import { User, Customer, Admin } from '../models/relational';
import { type ModelStatic, type Model, Op } from 'sequelize';
import {
    UserNotFoundError,
    UserAlreadyExistsError,
    InvalidCredentialsError,
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
    role?: string;
}

export interface UserCreationDetails extends UserDetails {
    password: string;
}

interface CustomerDetails {
    shippingAddress: string;
    billingAddress: string;
}

interface AuthTokens {
    refreshToken: string;
    accessToken: string;
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
    protected async registerUser<T extends Model>(
        userType: ModelStatic<T>,
        details: UserCreationDetails
    ): Promise<T> {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: details.username },
                    { email: details.email },
                ],
            },
        });

        if (user) {
            throw new UserAlreadyExistsError();
        } else {
            return await userType.create(details as T['_creationAttributes']);
        }
    }

    /**
     * Signs-Up a new customer user type in the platform.
     *
     * @param details - The details of the customer to sign-up
     * @returns A promise resolving to an object containing access and refresh tokens
     */
    public async signUpCustomer(
        details: UserCreationDetails
    ): Promise<AuthTokens> {
        const registeredCustomer = await this.registerUser(Customer, details);

        return this.generateTokens(
            registeredCustomer.userId!,
            registeredCustomer.username
        );
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
        let role = null;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            throw new UserNotFoundError();
        }

        const isPasswordValid = await user.validatePassword(password);

        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        const isAdmin = await Admin.findOne({ where: { userId: user.id } });

        if (isAdmin) {
            role = 'admin';
        } else {
            role = 'customer';
        }

        return this.generateTokens(user.id!, user.username, role);
    }

    /**
     * Generates refresh and access tokens for a user.
     *
     * @param userId - The ID of the user to generate tokens for
     * @param username - The username of the user
     * @param role - The role of the user
     * @returns An object containing access and refresh tokens
     */
    public generateTokens(
        userId: number,
        username: string,
        role: string = 'customer'
    ): AuthTokens {
        const refreshToken = jwt.sign(
            { userId, username, role },
            REFRESH_TOKEN_KEY!,
            {
                expiresIn: REFRESH_TOKEN_EXPIRY,
            }
        );

        const accessToken = jwt.sign(
            { userId, username, role },
            ACCESS_TOKEN_KEY!,
            {
                expiresIn: ACCESS_TOKEN_EXPIRY,
            }
        );

        return { refreshToken, accessToken };
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
     * Retrieves Customer by user ID.
     *
     * @param userId - The user ID of the Customer
     * @returns A promise resolving to a Customer instance
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the Customer is not found
     */
    public async getCustomerById(userId: number): Promise<Customer> {
        const customer = await Customer.findOne({
            where: { userId },
            include: User,
        });

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        return customer;
        // return customer.get({ plain: true });
    }

    /**
     * Changes a user's password.
     *
     * @param userId - The ID of the user to update
     * @param oldPassword - The old password
     * @param newPassword - The new password
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found.
     * @throws {@link InvalidCredentialsError}
     * Thrown if the old password is invalid.
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
            await user.hashPassword(newPassword);
            await user.save();
        } else {
            throw new InvalidCredentialsError();
        }
    }

    /**
     * Updates customer's shipping and billing details.
     *
     * @param userId - The user ID of the Customer
     * @param details - The shipping and billing details
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the Customer is not found.
     */
    public async updateCustomerDetails(
        userId: number,
        details: CustomerDetails
    ): Promise<Customer> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('User of type Customer not found');
        }

        return await customer.update(details);
    }

    /**
     * Updates a user in the database.
     *
     * @param userId - The ID of the user to update
     * @param details - The details of the user to update
     * @returns A promise resolving to the updated user
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found
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
     * Deletes a user from the database.
     *
     * @param userId - The ID of the user to delete
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found
     */
    public async deleteUser(userId: number): Promise<void> {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        await user.destroy();
    }
}
// A forgot password method should be implemented.
