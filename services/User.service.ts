import jwt from 'jsonwebtoken';
import { redisClient } from '@/config/redis';
import { type ModelStatic, type Model, Op } from 'sequelize';
import { queue2 } from '@/jobQueues';
import { addBirthdayJobScheduler } from '@/jobSchedulers';
import { PaymentService } from './Payment.service';
import { NotificationService } from './Notification.service';
import { User, Customer, Admin } from '@/models/relational';
import {
    UserNotFoundError,
    UserAlreadyExistsError,
    InvalidCredentialsError,
} from '@/errors';
import { adminNamespace } from '@/socket/admin';
import {
    UserDetails,
    UserCreationDetails,
    CustomerDetails,
    AuthTokens,
    CustomerResponse,
    UserType,
} from '@/types';

const {
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    GENERIC_TOKEN_KEY,
    REGISTRATION_LOYALTY_POINTS,
} = process.env;

/**
 * Service responsible for user-related operations.
 */
export class UserService {
    protected paymentService: PaymentService;
    protected notificationService: NotificationService;

    constructor(
        paymentService: PaymentService,
        notificationService: NotificationService
    ) {
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    /**
     * Streams active users of a given type.
     *
     * @param type - The user type
     */
    private async streamActiveUsers(type: UserType): Promise<void> {
        const filteringObject = {
            include: {
                model: User,
                as: 'user',
                where: { isActive: true },
                attributes: [],
            },
            attributes: [],
        };

        switch (type) {
            case 'admin':
            case 'manager': {
                const { count } = await Admin.findAndCountAll(filteringObject);
                adminNamespace.emit('activeAdmins', count);
                break;
            }
            case 'customer': {
                const { count } =
                    await Customer.findAndCountAll(filteringObject);
                adminNamespace.emit('activeCustomers', count);
                break;
            }
        }
    }

    /**
     * Creates a provided user type class instance.
     *
     * @remarks
     * This is a factory method that will be used by utility methods below
     * and in a subclass.
     *
     * @param userClass - The user type class
     * @param details - The details of the user to build
     * @returns A promise resolving to the created class instance
     *
     * @throws {@link UserAlreadyExistsError}
     * Thrown if the user already exists.
     */
    protected async userFactory<T extends Model>(
        userClass: ModelStatic<T>,
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
        }

        const { firstName, lastName, ...rest } = details;

        return userClass.build({
            firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
            lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
            ...rest,
        } as T['_creationAttributes']);
    }

    /**
     * Verify user email
     *
     * @param details - The details of the user to sign-up
     */
    public async verifyUserEmail(details: UserCreationDetails): Promise<void> {
        const user = await User.findOne({ where: { email: details.email } });

        if (user) {
            throw new UserAlreadyExistsError();
        }

        const token = await redisClient.hget(
            'emailVerification:tokens',
            details.email
        );

        if (token) {
            await redisClient.zadd(
                'blacklisted:tokens',
                Date.now() + 900000,
                token
            );
        }

        const verificationToken = jwt.sign({ details }, GENERIC_TOKEN_KEY, {
            expiresIn: '15m',
        });

        await redisClient.hset(
            'emailVerification:tokens',
            details.email,
            verificationToken
        );

        await this.notificationService.sendEmailVerificationEmail(
            details.email,
            verificationToken
        );
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
        const newCustomer = await this.userFactory(Customer, {
            ...details,
            isActive: true,
        });
        newCustomer.stripeId = await this.paymentService.createCustomer(
            `${newCustomer.firstName} ${newCustomer.lastName}`,
            newCustomer.email
        );
        newCustomer.loyaltyPoints = REGISTRATION_LOYALTY_POINTS;

        await newCustomer.save();

        await this.streamActiveUsers('customer');

        if (newCustomer.birthday) {
            await addBirthdayJobScheduler(newCustomer);
        }

        await this.notificationService.sendWelcomeEmail(
            newCustomer.firstName,
            newCustomer.email
        );

        return this.generateTokens(newCustomer.userId!, newCustomer.username);
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
        let type: UserType | null = null;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            throw new UserNotFoundError();
        }

        const isPasswordValid = await user.validatePassword(password);

        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        const admin = await Admin.findOne({ where: { userId: user.id } });

        type = admin ? admin.role! : 'customer';

        user.isActive = true;
        await user.save();

        await this.streamActiveUsers(type);

        return this.generateTokens(user.id!, user.username, type);
    }

    /**
     * Generates refresh and access tokens for a user.
     *
     * @param userId - The ID of the user to generate tokens for
     * @param username - The username of the user
     * @param type - The type of the user
     * @returns An object containing access and refresh tokens
     */
    public generateTokens(
        userId: number,
        username: string,
        type: string = 'customer'
    ): AuthTokens {
        const refreshToken = jwt.sign(
            { userId, username, type },
            REFRESH_TOKEN_KEY,
            {
                expiresIn: REFRESH_TOKEN_EXPIRY,
            }
        );

        const accessToken = jwt.sign(
            { userId, username, type },
            ACCESS_TOKEN_KEY,
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
     * Retrieves Customer by its Id.
     *
     * @param customerId - The id of the Customer
     * @returns A promise resolving to a Customer instance
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the Customer is not found
     */
    public async getCustomerById(
        customerId: number
    ): Promise<CustomerResponse> {
        const customer = await Customer.findByPk(customerId, {
            attributes: [
                'id',
                'stripeId',
                'shippingAddress',
                'billingAddress',
                'isActive',
                'createdAt',
            ],
            include: {
                model: User,
                as: 'user',
                attributes: [
                    'profilePictureUrl',
                    'firstName',
                    'lastName',
                    'username',
                    'email',
                ],
            },
        });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const { user, ...rest } = customer.toJSON();

        return { ...rest, ...user };
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
            await user.hashAndStorePassword(newPassword);
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
     * Marks user notification as read.
     *
     * @param userId - The ID of the user
     * @param [notificationId] - The ID of the notification
     * @param [all] - Whether to mark all notifications as read
     */
    public async markNotificationAsRead(
        userId: number,
        notificationId?: number,
        all?: boolean
    ) {
        await this.notificationService.markAsRead(userId, notificationId, all);
    }

    /**
     * Logs a user out.
     *
     * @param userId - The ID of the user to log out
     * @param type - The type of the user ('admin', 'manager', 'customer')
     */
    public async logoutUser(userId: number, type: UserType): Promise<void> {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        user.isActive = false;
        await user.save();

        await this.streamActiveUsers(type);
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
        const [user, customer] = await Promise.all([
            User.findByPk(userId),
            Customer.findOne({ where: { userId } }),
        ]);

        if (!user) {
            throw new UserNotFoundError();
        }

        if (customer) {
            await this.paymentService.deleteCustomer(customer.stripeId);
            await queue2.removeJobScheduler(
                'birthday:scheduler:' + user.username
            );
        }

        await user.destroy();
    }

    /**
     * Removes user notification/s.
     *
     * @param userId - The ID of the user
     * @param [notificationId] - The ID of the notification
     * @param [all] - Whether to remove all notifications
     */
    public async deleteNotification(
        userId: number,
        notificationId?: number,
        all?: boolean
    ): Promise<void> {
        await this.notificationService.removeNotification(
            userId,
            notificationId,
            all
        );
    }

    /**
     * Requests a password reset for a user.
     *
     * @param userEmail - The email of the user
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found
     */
    public async requestPasswordReset(userEmail: string): Promise<void> {
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            throw new UserNotFoundError();
        }

        const resetToken = jwt.sign({ id: user.id }, GENERIC_TOKEN_KEY!, {
            expiresIn: '15m',
        });

        await this.notificationService.sendPasswordResetEmail(
            user.email,
            user.firstName,
            resetToken
        );
    }

    /**
     * Resets user's password.
     *
     * @param userId - The ID of the user
     * @param newPassword - The new password to set
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found
     */
    public async resetPassword(
        userId: string,
        newPassword: string
    ): Promise<void> {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        await user.hashAndStorePassword(newPassword);
        await user.save();
    }
}
