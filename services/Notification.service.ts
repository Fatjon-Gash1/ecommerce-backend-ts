import nodemailer from 'nodemailer';
import pLimit from 'p-limit';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';
import * as Handlebars from 'handlebars';
import { transporter } from '@/config/transporter';
import { redisClient } from '@/config/redis';
import { io } from '@/config/socket';
import { Op } from 'sequelize';
import { LoggerService } from './Logger.service';
import { Customer, User, Notification } from '@/models/relational';
import { EmailNotificationError, NotificationNotFoundError } from '@/errors';
dotenv.config();

Handlebars.registerHelper(
    'ifeq',
    function (this: unknown, arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    }
);

const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
});

const TEMPLATES_PATH = (process.env.BASE_PATH as string) + '/templates';
const CLIENT_URL = process.env.CLIENT_URL as string;

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

interface NewProduct {
    name: string;
    price: number;
    discount?: number;
    imageUrl: string;
}

type Promotion = 'newArrival' | 'discount';

interface PromotionData {
    file: string;
    shopRoute: string;
    subject: string;
}

interface HandledRefundEmailData {
    status: 'approved' | 'denied';
    orderTrackingNumber: string;
    orderTotal: string;
    refundAmount: string | null;
    rejectionReason?: string;
}

interface SuccessfulPaymentEmailData {
    customerName: string;
    orderTrackingNumber: string;
    deliveryDate: string;
    paymentAmount: string;
    deliveryAddress: string;
    subscriptionStateInfo: string;
    manageSubscriptionLink: string;
    customerSupportEmail: string;
    customerSupportPhoneNumber: string;
}

interface FailedPaymentEmailData {
    manageSubscriptionLink: string;
    customerSupportEmail: string;
    customerSupportPhoneNumber: string;
}

/**
 * Service responsible for handling platform notifications.
 */
export class NotificationService {
    private transporter: nodemailer.Transporter;
    private logger: LoggerService;

    constructor() {
        this.transporter = transporter;
        this.logger = new LoggerService();
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
        this.logger.log(`Email sent to: ${options.to}`);
    }

    /**
     * Sends an email to all customers about new promotions.
     * @param products - An array of promoted products
     *
     * Throws {@link EmailNotificationError}
     * Thrown if it fails to send the email to some of the customers.
     */
    public async sendPromotionsEmail(
        products: NewProduct[],
        promotion: Promotion
    ): Promise<void> {
        const maxDiscount =
            promotion === 'discount'
                ? Math.max(
                      ...products
                          .map((product) => product.discount)
                          .filter((discount) => discount !== undefined)
                  )
                : null;
        const promotions = new Map<Promotion, PromotionData>([
            [
                'newArrival',
                {
                    file: 'send-new-product-arrivals-email.hbs',
                    shopRoute: '/new-arrivals/shop',
                    subject: 'New products have arrived!',
                },
            ],
            [
                'discount',
                {
                    file: 'send-product-discounts-email.hbs',
                    shopRoute: '/discounted-products/shop',
                    subject: `New discounts up to ${maxDiscount}% off!`,
                },
            ],
        ]);

        const customers = await Customer.findAll({
            include: {
                model: User,
                as: 'user',
                attributes: ['firstName', 'email'],
            },
            attributes: [],
        });

        const failedEmails = new Set<string>();
        const limit = pLimit(100);
        const emailFile = await readFile(
            path.join(TEMPLATES_PATH, promotions.get(promotion)!.file),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);
        const data = {
            products,
            maxDiscount,
            shopUrl: CLIENT_URL + promotions.get(promotion)!.shopRoute,
        };
        const htmlData = template(data);

        const sendEmailWithErrorHandling = async (customer: {
            firstName: string;
            email: string;
        }): Promise<void> => {
            try {
                await this.sendEmail({
                    to: customer.email,
                    subject: promotions.get(promotion)!.subject,
                    html: htmlData,
                });
            } catch (error) {
                this.logger.error(
                    `Failed to send email to: ${customer.email}` + error
                );
                failedEmails.add(customer.email);
            }
        };

        const emailPromises = customers.map((customer) =>
            limit(() => sendEmailWithErrorHandling(customer.user!))
        );

        await Promise.allSettled(emailPromises);

        if (failedEmails.size > 0) {
            throw new EmailNotificationError(
                `Failed to send emails to the following addresses: ${[...failedEmails].join(', ')}`
            );
        }
    }

    /**
     * Sends emails to non-subscribed customers on membership price discount.
     *
     * @param membershipType - The membership type
     * @param pricePlan - The price plan (Annual or Monthly)
     * @param oldPrice - The old price of the membership plan
     * @param discountedPrice - The discounted price
     */
    public async sendMembershipDiscountEmailToNonSubscribers(
        membershipType: string,
        pricePlan: 'annual' | 'monthly',
        oldPrice: number,
        discountedPrice: number
    ): Promise<void> {
        const customers = await Customer.findAll({
            where: { membership: { [Op.not]: membershipType } },
            include: {
                model: User,
                as: 'user',
                attributes: ['firstName', 'email'],
            },
            attributes: [],
        });

        const discountPercentage = (
            ((oldPrice - discountedPrice) / oldPrice) *
            100
        ).toFixed(2);

        const failedEmails = new Set<string>();
        const limit = pLimit(100);
        const emailFile = await readFile(
            path.join(
                TEMPLATES_PATH,
                'send-email-on-membership-price-discount-to-non-subscribers.hbs'
            ),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);
        const data = {
            membershipType:
                membershipType.charAt(0).toUpperCase() +
                membershipType.slice(1),
            pricePlan: pricePlan.charAt(0).toUpperCase() + pricePlan.slice(1),
            oldPrice: formatter.format(oldPrice),
            discountedPrice: formatter.format(discountedPrice),
            discountPercentage,
            subscribeUrl:
                CLIENT_URL +
                `/subscribe?membership=${membershipType}&plan=${pricePlan}`,
        };

        const sendEmailWithErrorHandling = async (customer: {
            firstName: string;
            email: string;
        }): Promise<void> => {
            try {
                const htmlData = template({
                    firstName: customer.firstName,
                    ...data,
                });

                await this.sendEmail({
                    to: customer.email,
                    subject: `"${data.membershipType}" 
                    Membership Discount on the ${data.pricePlan} Plan`,
                    html: htmlData,
                });
            } catch (error) {
                this.logger.error(
                    `Failed to send email to: ${customer.email}` + error
                );
                failedEmails.add(customer.email);
            }
        };

        const creationPromises = customers.map((customer) =>
            limit(() => sendEmailWithErrorHandling(customer.user!))
        );

        await Promise.allSettled(creationPromises);

        if (failedEmails.size > 0) {
            throw new EmailNotificationError(
                `Failed to send emails to the following addresses: ${[...failedEmails].join(', ')}`
            );
        }
    }

    /**
     * Sends emails to subscribed customers on membership price increase.
     *
     * @param subscriptionData - A map that contains the stripe customer id and the end date of the customer subscription
     * @param membershipPlan - The membership plan (plus, premium)
     * @param pricePlan - The price plan (Annual or Monthly)
     * @param oldPrice - The old price of the membership plan
     * @param increasedPrice - The increased price of the membership plan
     */
    public async sendEmailOnMembershipPriceIncrease(
        subscriptionData: Map<string, number>,
        membershipPlan: string,
        pricePlan: 'annual' | 'monthly',
        oldPrice: number,
        increasedPrice: number
    ): Promise<void> {
        const customers = await Customer.findAll({
            where: { stripeId: Array.from(subscriptionData.keys()) },
            include: {
                model: User,
                as: 'user',
                attributes: ['firstName', 'email'],
            },
            attributes: ['stripeId'],
        });

        const failedEmails = new Set<string>();
        const limit = pLimit(100);
        const emailFile = await readFile(
            path.join(
                TEMPLATES_PATH,
                'send-email-on-membership-price-increase.hbs'
            ),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);
        const data = {
            membershipPlan,
            pricePlan,
            oldPrice: formatter.format(oldPrice),
            increasedPrice: formatter.format(increasedPrice),
        };

        const sendEmailWithErrorHandling = async (
            customer: {
                firstName: string;
                email: string;
            },
            customerStripeId: string
        ): Promise<void> => {
            try {
                const timeRemaining = subscriptionData.get(customerStripeId)!;
                const htmlData = template({
                    firstName: customer.firstName,
                    timeRemaining: new Date(timeRemaining * 1000).toUTCString(),
                    acceptUrl:
                        CLIENT_URL +
                        `/confirm-membership?type=${membershipPlan}&plan=${pricePlan}&time_left=${timeRemaining}`,
                    ...data,
                });

                await this.sendEmail({
                    to: customer.email,
                    subject:
                        'Membership price increased! Please confirm your plan',
                    html: htmlData,
                });
            } catch (error) {
                this.logger.error(
                    `Failed to send email to: ${customer.email}` + error
                );
                failedEmails.add(customer.email);
            }
        };

        const creationPromises = customers.map((customer) =>
            limit(() =>
                sendEmailWithErrorHandling(customer.user!, customer.stripeId)
            )
        );

        await Promise.allSettled(creationPromises);

        if (failedEmails.size > 0) {
            throw new EmailNotificationError(
                `Failed to send emails to the following addresses: ${[...failedEmails].join(', ')}`
            );
        }
    }

    /**
     * Sends a welcome email to a newly registered customer.
     *
     * @param firstName - The first name of the customer
     * @param email - The email of the customer
     */
    public async sendWelcomeEmail(
        firstName: string,
        email: string
    ): Promise<void> {
        const emailFile = await readFile(
            path.join(TEMPLATES_PATH, 'customer-welcome-email.hbs'),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);
        const htmlData = template({
            firstName,
            loginUrl: CLIENT_URL + '/login',
        });

        try {
            await this.sendEmail({
                to: email,
                subject: `Welcome to EdgeTech, ${firstName}!`,
                html: htmlData,
            });
        } catch (error) {
            this.logger.error('Error sending welcome email: ' + error);
        }
    }

    /**
     * Sends an email with a promotion code to a customer on its birthday.
     *
     * @param email - The email of the customer
     * @param firstName - The first name of the customer
     * @param birthday - The birthday of the customer
     * @param promotionCode - The customer's promotion code
     */
    public async sendBirthdayPromotionCodeEmail(
        email: string,
        firstName: string,
        birthday: Date,
        promotionCode: string
    ): Promise<void> {
        const age = (() => {
            const ageDifMs = Date.now() - new Date(birthday).getTime();
            const ageDate = new Date(ageDifMs);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        })();
        const redeemUrl = `${CLIENT_URL}/memberships`;

        const emailFile = await readFile(
            path.join(TEMPLATES_PATH, 'send-birthday-promotion-code-email.hbs'),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);
        const htmlData = template({ firstName, age, promotionCode, redeemUrl });

        try {
            await this.sendEmail({
                to: email,
                subject: `Happy Birthday, ${firstName}! Here is your 50% off promotion code`,
                html: htmlData,
            });
        } catch (error) {
            this.logger.error(
                'Error sending birthday promotion email: ' + error
            );
        }
    }

    /**
     * Sends a rewarding email to a customer on a holiday.
     *
     * @param email - The email of the customer
     * @param firstName - The first name of the customer
     * @param holiday - The name of the holiday
     * @param loyaltyPoints - The amount of loyalty points the customer has been rewarded
     * @param [promotionCode] - The customer's promotion code
     * @param [percentOff] - The percentage of the promocode discount
     */
    public async sendHolidayPromotionEmail(
        email: string,
        firstName: string,
        holiday: string,
        loyaltyPoints: number,
        promotionCode: string | null,
        percentOff: number | null
    ): Promise<void> {
        const redeemUrl = `${CLIENT_URL}/memberships`;

        const emailFile = await readFile(
            path.join(TEMPLATES_PATH, 'send-holiday-promotion-email.hbs'),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);
        const htmlData = template({
            firstName,
            holiday,
            loyaltyPoints,
            promotionCode,
            percentOff,
            redeemUrl,
        });

        try {
            await this.sendEmail({
                to: email,
                subject: `Happy ${holiday}, ${firstName}! Here is your loyalty points bonus${promotionCode ? ` and a ${percentOff}% off promotion code!` : '!'}`,
                html: htmlData,
            });
        } catch (error) {
            this.logger.error(
                'Error sending holiday promotion email: ' + error
            );
        }
    }

    /**
     * Sends a handled refund request email to a customer.
     *
     * Throws {@link EmailNotificationError}
     * Thrown if it fails to send the email to the customer.
     */
    public async sendHandledRefundEmail(
        customerEmail: string,
        data: HandledRefundEmailData
    ): Promise<void> {
        const emailFile = await readFile(
            path.join(TEMPLATES_PATH, 'send-handled-refund-request-email.hbs'),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);
        const htmlData = template(data);

        try {
            await this.sendEmail({
                to: customerEmail,
                subject: `Refund request for order ${data.orderTrackingNumber}`,
                html: htmlData,
            });
        } catch (error) {
            this.logger.error('Error sending handled refund email: ' + error);
        }
    }

    /**
     * Sends a successful or failed payment email to a customer on replenishment.
     *
     * @userEmail - The email of the customer
     * @subject - The subject of the email
     * @emailTemplate - The template of the email
     * @data - The data to be sent in the email
     */
    public async sendReplenishmentPaymentEmail(
        userEmail: string,
        subject: string,
        emailTemplate: string,
        data: SuccessfulPaymentEmailData | FailedPaymentEmailData
    ): Promise<void> {
        const emailFile = await readFile(
            path.join(TEMPLATES_PATH, emailTemplate),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);

        const htmlData = template(data);

        await this.sendEmail({
            to: userEmail,
            subject,
            text: 'Fallback test',
            html: htmlData,
        });
    }

    /**
     * Sends a password reset email to a user.
     *
     * @param userEmail - The email of the user
     * @param firstName - The first name of the user
     * @param resetToken - The reset token
     *
     * Throws {@link EmailNotificationError}
     * Thrown if it fails to send the email to the user.
     */
    public async sendPasswordResetEmail(
        userEmail: string,
        firstName: string,
        resetToken: string
    ): Promise<void> {
        const emailFile = await readFile(
            path.join(TEMPLATES_PATH, 'send-password-reset-email.hbs'),
            'utf-8'
        );
        const template = Handlebars.compile(emailFile);

        const resetLink = CLIENT_URL + `/reset-password?token=${resetToken}`;
        const htmlData = template({ firstName, resetLink });

        try {
            await this.sendEmail({
                to: userEmail,
                subject: 'Reset Your Account Password',
                html: htmlData,
            });
        } catch (error) {
            this.logger.error('Error sending password reset email: ' + error);
        }
    }

    /**
     * Generic method that sends in-platfrom notifications to users.
     *
     * @param userId - The id of the user to send the notification to
     * @param messages - The messages to send
     */
    public async sendNotification(
        userId: number,
        ...messages: string[]
    ): Promise<void> {
        for (const message of messages) {
            const notification = await Notification.create({ userId, message });

            const socketId = await redisClient.hget(
                'onlineUsers',
                userId.toString()
            );
            if (socketId) {
                io.to(socketId).emit('notification', notification);
            }
        }
    }

    /**
     * Marks user notification as read.
     *
     * @param userId - The user id
     * @param notificationId - The notification id
     *
     * @throws Error
     * Thrown if the notification is not found
     */
    public async markAsRead(
        userId: number,
        notificationId: number
    ): Promise<void> {
        const notification = await Notification.findOne({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        notification.read = true;
        await notification.save();
    }

    /**
     * Removes a customer notification.
     *
     * @param userId - The customer's user id
     * @param notificationId - The notification id
     */
    public async removeNotification(
        userId: number,
        notificationId: number
    ): Promise<void> {
        const notification = await Notification.destroy({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new NotificationNotFoundError();
        }
    }
}
