import { NotificationService, PaymentService, UserService } from '@/services';
import { addBirthdayJobScheduler } from '@/schedulers';
import { redisClient, workerRedisClient } from '@/config/redis';
import { birthdayPromoQueue } from '@/queues';
import type { Model, ModelStatic } from 'sequelize';
import {
    Admin,
    Courier,
    SupportAgent,
    User,
    Customer,
} from '@/models/relational';
import type { AuthTokens, UserType, UserCreationDetails } from '@/types';
import {
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserNotFoundError,
} from '@/errors';
import jwt from 'jsonwebtoken';

beforeAll(() => {
    process.env.REGISTRATION_LOYALTY_POINTS = 100;
});

class TestableUserService extends UserService {
    public override async userFactory<T extends Model>(
        userClass: ModelStatic<T>,
        details: UserCreationDetails
    ): Promise<T> {
        return super.userFactory(userClass, details);
    }

    public override streamActiveUsers(type: UserType): Promise<void> {
        return super.streamActiveUsers(type);
    }

    public exposedPaymentService = this.paymentService;
    public exposedNotificationService = this.notificationService;
}

describe('UserService', () => {
    const paymentService = new PaymentService('abc');
    const notificationService = new NotificationService();
    const userService = new TestableUserService(
        paymentService,
        notificationService
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signUpCustomer', () => {
        const mockCustomer: UserCreationDetails = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'john.doe',
            birthday: new Date(),
            password: 'password123',
        };

        const mockTokens: AuthTokens = {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        };

        beforeEach(() => {
            jest.spyOn(userService, 'userFactory').mockResolvedValue({
                userId: 1,
                ...mockCustomer,
                membership: 'free',
                save: jest.fn(),
            } as unknown as Customer);
            jest.spyOn(userService, 'streamActiveUsers').mockResolvedValue(
                undefined
            );
            jest.spyOn(userService, 'generateTokens').mockReturnValue(
                mockTokens
            );
        });

        it('should create a new customer and return auth tokens', async () => {
            const result = await userService.signUpCustomer(mockCustomer);

            expect(
                userService.exposedPaymentService!.createCustomer
            ).toHaveBeenCalledWith('John Doe', 'john@example.com');

            expect(userService.streamActiveUsers).toHaveBeenCalledWith(
                'customer'
            );

            expect(addBirthdayJobScheduler).toHaveBeenCalledWith(
                expect.objectContaining({ firstName: 'John' })
            );

            expect(
                userService.exposedNotificationService!.sendWelcomeEmail
            ).toHaveBeenCalledWith('John', 'john@example.com');

            expect(userService.generateTokens).toHaveBeenCalledWith(
                1,
                'john.doe',
                'customer',
                'free'
            );

            expect(result).toStrictEqual(mockTokens);
        });

        it('should skip scheduling birthday job if customer has no birthday', async () => {
            const details = {
                userId: 1,
                ...mockCustomer,
                birthday: undefined,
                membership: 'free',
                save: jest.fn(),
            };

            (userService.userFactory as jest.Mock).mockResolvedValueOnce(
                details
            );

            await userService.signUpCustomer(details);

            expect(addBirthdayJobScheduler).not.toHaveBeenCalled();
        });
    });

    describe('verifyUserEmail', () => {
        const details: UserCreationDetails = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'john.doe',
            birthday: new Date(),
            password: 'password123',
        };

        it('should throw UserAlreadyExistsError if user already exists', async () => {
            (User.findOne as jest.Mock).mockResolvedValue({ id: 1 });

            await expect(userService.verifyUserEmail(details)).rejects.toThrow(
                UserAlreadyExistsError
            );

            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: details.email },
            });

            expect(redisClient.hget).not.toHaveBeenCalled();
        });

        it('should blacklist existing token if found in redis', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (redisClient.hget as jest.Mock).mockResolvedValue('oldToken');
            jwt.sign = jest.fn().mockReturnValue('newToken');

            await userService.verifyUserEmail(details);

            expect(redisClient.zadd).toHaveBeenCalledWith(
                'blacklisted:tokens',
                expect.any(Number),
                'oldToken'
            );
            expect(redisClient.hset).toHaveBeenCalledWith(
                'emailVerification:tokens',
                details.email,
                'newToken'
            );
            expect(
                userService.exposedNotificationService!
                    .sendEmailVerificationEmail
            ).toHaveBeenCalledWith(details.email, 'newToken');
        });

        it('should skip blacklisting if no existing token is found', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (redisClient.hget as jest.Mock).mockResolvedValue(null);
            jwt.sign = jest.fn().mockReturnValue('freshToken');

            await userService.verifyUserEmail(details);

            expect(redisClient.zadd).not.toHaveBeenCalled();
            expect(redisClient.hset).toHaveBeenCalledWith(
                'emailVerification:tokens',
                details.email,
                'freshToken'
            );
            expect(
                userService.exposedNotificationService!
                    .sendEmailVerificationEmail
            ).toHaveBeenCalledWith(details.email, 'freshToken');
        });
    });

    describe('loginUser', () => {
        const username = 'john.doe';
        const password = 'password123';
        let mockUser: Partial<User>;

        const mockTokens: AuthTokens = {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        };

        beforeEach(() => {
            mockUser = {
                id: 1,
                username: 'john.doe',
                validatePassword: jest.fn(),
                save: jest.fn().mockResolvedValue(true),
            } as unknown as User;
            jest.spyOn(userService, 'streamActiveUsers').mockResolvedValue(
                undefined
            );
            jest.spyOn(userService, 'generateTokens').mockReturnValue(
                mockTokens
            );
        });

        it('should throw UserNotFoundError if user does not exist', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                userService.loginUser(username, password)
            ).rejects.toThrow(UserNotFoundError);

            expect(User.findOne).toHaveBeenCalledWith({
                where: { username },
            });
        });

        it('should throw InvalidCredentialsError if password is invalid', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (mockUser.validatePassword as jest.Mock).mockReturnValue(false);

            await expect(
                userService.loginUser(username, password)
            ).rejects.toThrow(InvalidCredentialsError);
        });

        it('should set the user type to customer and fetch membership', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (mockUser.validatePassword as jest.Mock).mockResolvedValue(true);

            (Admin.findOne as jest.Mock).mockResolvedValue(null);
            (SupportAgent.findOne as jest.Mock).mockResolvedValue(null);
            (Courier.findOne as jest.Mock).mockResolvedValue(null);
            (Customer.findOne as jest.Mock).mockResolvedValue({
                membership: 'free',
            });

            const result = await userService.loginUser(username, password);

            expect(mockUser.save).toHaveBeenCalled();
            expect(userService.streamActiveUsers).toHaveBeenCalledWith(
                'customer'
            );
            expect(Customer.findOne).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                attributes: ['membership'],
            });
            expect(userService.generateTokens).toHaveBeenCalledWith(
                mockUser.id,
                username,
                'customer',
                'free'
            );
            expect(result).toStrictEqual(mockTokens);
        });
    });

    describe('deleteUser', () => {
        let mockUser: Partial<User>;
        let mockCustomer: Partial<Customer>;

        beforeEach(() => {
            mockUser = {
                id: 1,
                username: 'john.doe',
                destroy: jest.fn().mockResolvedValue(true),
            } as unknown as User;

            mockCustomer = {
                stripeId: 'user_123',
            } as unknown as Customer;
        });

        it('should throw UserNotFoundError if user does not exist', async () => {
            (User.findByPk as jest.Mock).mockResolvedValue(null);
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await expect(userService.deleteUser(mockUser.id!)).rejects.toThrow(
                UserNotFoundError
            );

            expect(User.findByPk).toHaveBeenCalledWith(mockUser.id);
        });

        it('should only remove user if its not a customer', async () => {
            (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
            (Customer.findOne as jest.Mock).mockResolvedValue(null);

            await userService.deleteUser(mockUser.id!);

            expect(
                userService.exposedPaymentService!.deleteCustomer
            ).not.toHaveBeenCalled();
            expect(
                birthdayPromoQueue.removeJobScheduler
            ).not.toHaveBeenCalled();
            expect(mockUser.destroy).toHaveBeenCalled();
        });

        it('should delete customer from stripe, remove birthday job, and remove user', async () => {
            (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
            (Customer.findOne as jest.Mock).mockResolvedValue(mockCustomer);

            await userService.deleteUser(mockUser.id!);

            expect(
                userService.exposedPaymentService!.deleteCustomer
            ).toHaveBeenCalledWith(mockCustomer.stripeId);
            expect(birthdayPromoQueue.removeJobScheduler).toHaveBeenCalledWith(
                'birthday:scheduler:' + mockUser.username
            );
            expect(mockUser.destroy).toHaveBeenCalled();
        });
    });
});

afterAll(async () => {
    if (redisClient.quit) await redisClient.quit();
    if (workerRedisClient.quit) await workerRedisClient.quit();

    if (birthdayPromoQueue.close) await birthdayPromoQueue.close();
});
