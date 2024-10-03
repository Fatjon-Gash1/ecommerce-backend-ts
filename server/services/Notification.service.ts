import redis from 'redis';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { User } from '../models/relational';
import { NotificationError, EmailNotificationError } from '../errors';
dotenv.config();

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

/**
 * Service responsible for handling platform notifications.
 */

export class NotificationService {
    /**
     * Redis client instace used to publish messages to Redis server.
     */
    private publisher: ReturnType<typeof redis.createClient>;
    /**
     * Nodemailer transporter used to send emails.
     */
    private transporter: nodemailer.Transporter;

    /**
     * Initialize the redis and nodemailer clients.
     */
    constructor() {
        this.publisher = redis.createClient();
        this.initRedis();
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });
    }
    /**
     *
     * Connects to redis server.
     *
     * @throws {Error}
     * Throws an error if Redis connection fails.
     */
    private async initRedis(): Promise<void> {
        try {
            await this.publisher.connect();
        } catch (err) {
            console.error('Error connecting to Redis: ', err);
            throw new Error('Failed to connect to Redis');
        }
    }

    /**
     * Notifies customers about new order confirmation.
     *
     * Throws {@link NotificationError}
     * Thrown if it fails to publish the notification.
     */
    public async orderConfirmationNotify(): Promise<void> {
        try {
            await this.publisher.publish('order_shipment', 'order delivered');
        } catch (err) {
            console.error(
                'Error publishing order confirmation notification:',
                err
            );
            throw new NotificationError('Failed to publish order confirmation');
        }
    }

    /**
     * Notifies customers about products back in stock.
     *
     * Throws {@link NotificationError}
     * Thrown if it fails to publish the notification.
     */
    public async productBackInStockNotify(): Promise<void> {
        try {
            await this.publisher.publish(
                'back_in_stock',
                'product back in stock'
            );
        } catch (err) {
            console.error(
                'Error publishing product stock status notification:',
                err
            );
            throw new NotificationError(
                'Failed to publish back in stock notification'
            );
        }
    }

    /**
     * Notifies customers about new product offers.
     *
     * Throws {@link NotificationError}
     * Thrown if it fails to publish the notification.
     */
    public async newOffersNotify(): Promise<void> {
        try {
            await this.publisher.publish('offers', 'new products available');
        } catch (err) {
            console.error('Error publishing new offers notification:', err);
            throw new NotificationError(
                'Failed to publish new offers notification'
            );
        }
    }

    /**
     * Generic email sending method.
     *
     * @param options - The email options
     * Throws {Error}
     * Thrown if it fails to send the email
     */
    public async sendEmail(options: EmailOptions): Promise<void> {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: options.to,
            subject: options.subject,
            text: options.text || '',
            html: options.html || '',
        };

        await this.transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${options.to}`);
    }

    /**
     * Sends an email to all users about new product promotions.
     *
     * Throws {@link EmailNotificationError}
     * Thrown if it fails to send some emails to the customers.
     */
    public async sendNewPromotionsEmail(): Promise<void> {
        const users = await User.findAll();
        const failedEmails: string[] = [];

        const emailPromises = users.map(async (user) => {
            try {
                await this.sendEmail({
                    to: user.email,
                    subject: 'New products have arrived!',
                    text: `Hello, ${user.firstName}. Please check our new products.`,
                });
            } catch (err) {
                console.error(`Failed to send email to: ${user.email}`, err);
                failedEmails.push(user.email);
            }
        });

        await Promise.all(emailPromises);

        if (failedEmails.length > 0) {
            throw new EmailNotificationError(
                `Failed to send emails to the following addresses: ${failedEmails.join(', ')}`
            );
        }
    }

    /**
     * Sends a welcome email to a newly registered customer.
     *
     * Throws {@link EmailNotificationEmail}
     * Thrown if it fails to send the email to the customer.
     */
    public async sendWelcomeEmail(
        firstName: string,
        email: string
    ): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: `Welcome to EdgeTech, ${firstName}!`,
            text: `Hello, ${firstName}. We're glad you joined us.`,
        });
    }
}
