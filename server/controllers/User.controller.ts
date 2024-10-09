import { Request, Response } from 'express';
import { UserService, NotificationService } from '../services';
import { JwtPayload } from 'jsonwebtoken';
import {
    UserNotFoundError,
    InvalidCredentialsError,
    InvalidUserTypeError,
} from '../errors';

export class UserController {
    private userService: UserService;
    private notificationService: NotificationService;

    constructor(
        userService: UserService,
        notificationService: NotificationService
    ) {
        this.userService = userService;
        this.notificationService = notificationService;
    }

    public async signUpUser(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userType, details } = req.body;

        try {
            const { refreshToken, accessToken } =
                await this.userService.signUpUser(userType, details);

            res.status(201)
                .cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000,
                })
                .json({
                    accessToken,
                    message: 'User signed up successfully',
                });

            await this.notificationService.sendWelcomeEmail(
                details.firstName,
                details.email
            );
        } catch (error) {
            if (error instanceof InvalidUserTypeError) {
                console.error('Error signing up user: ', error);
                return res.status(400).json({ message: 'Invalid user type' });
            }

            console.error('Error signing up user: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async loginUser(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username, password } = req.body;

        try {
            const { refreshToken, accessToken } =
                await this.userService.loginUser(username, password);

            return res
                .status(200)
                .cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000,
                })
                .json({
                    accessToken,
                    message: 'User logged in successfully',
                });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error logging in user: ', error);
                return res.status(404).json({ message: 'User not found' });
            }

            if (error instanceof InvalidCredentialsError) {
                console.error('Error logging in user: ', error);
                return res.status(400).json({ message: 'Invalid password' });
            }

            console.error('Error logging in user: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public generateTokens(req: Request, res: Response): void | Response {
        const { userId, username, role } = req.user as JwtPayload;

        try {
            const { refreshToken, accessToken } =
                this.userService.generateTokens(userId, username, role);

            return res
                .status(200)
                .cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000,
                })
                .json({ accessToken });
        } catch (error) {
            console.error('Error generating tokens: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async logoutUser(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            return res
                .status(200)
                .clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    path: '/',
                })
                .json({ message: 'Refresh token deleted successfully' });
        } catch (error) {
            console.error('Error deleting refresh token: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async checkUserAvailability(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username, email } = req.query;

        const field: string | null = username
            ? 'username'
            : email
              ? 'email'
              : null;

        if (!field) {
            return res
                .status(400)
                .json({ message: 'Username or Email is required' });
        }

        try {
            const availability = await this.userService.checkUserAvailability(
                field,
                req.query[field] as string
            );

            return res.status(200).json({ availability });
        } catch (error) {
            console.error(`Error checking ${field} availability: `, error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerProfile(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId = Number((req.user as JwtPayload).id);

        try {
            const customer = await this.userService.getCustomerById(customerId);
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

    public async changePassword(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const userId: number = Number((req.user as JwtPayload).id);
        const { oldPassword, newPassword } = req.body;

        try {
            await this.userService.changePassword(
                userId,
                oldPassword,
                newPassword
            );
            return res
                .status(201)
                .json({ message: 'Password changed successfully' });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error changing password: ', error);
                return res.status(404).json({ message: 'User not found' });
            }

            console.error('Error changing password: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateCustomerDetails(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId = Number((req.user as JwtPayload).id);
        const { details } = req.body;

        try {
            const customer = await this.userService.updateCustomerDetails(
                customerId,
                details
            );
            return res.status(200).json({ customer });
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                console.error(
                    'Error adding shipping details to customer: ',
                    err
                );
                return res.status(404).json({ message: 'Customer not found' });
            }

            console.error('Error adding shipping details to customer: ', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateUser(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const userId: number = Number((req.user as JwtPayload).id);
        const details = req.body;

        try {
            const user = await this.userService.updateUser(userId, details);
            return res.status(201).json({ user });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error updating user: ', error);
                return res.status(404).json({ message: 'User not found' });
            }

            console.error('Error updating user: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteAccount(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const userId: number = Number((req.user as JwtPayload).id);

        try {
            await this.userService.deleteUser(userId);
            return res
                .status(200)
                .json({ message: 'User deleted successfully' });
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
