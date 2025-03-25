import { Request, Response } from 'express';
import { PaymentService, LoggerService } from '@/services';
import { JwtPayload } from 'jsonwebtoken';
import {
    OrderNotFoundError,
    ProductNotFoundError,
    UserNotFoundError,
} from '@/errors';
import Stripe from 'stripe';

export class PaymentController {
    private paymentService: PaymentService;
    private logger: LoggerService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
        this.logger = new LoggerService();
    }

    public async addPaymentDetails(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const { ['payment-type']: paymentType, token } = req.query;

        try {
            await this.paymentService.addPaymentDetails(
                userId,
                paymentType as 'card',
                token as string
            );
            res.status(200).json({
                message: 'Payment details added successfully',
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error adding payment details:' + error);
                res.status(404).json({ message: error.message });
            }

            this.logger.error('Error adding payment details:' + error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async setDefaultPaymentMethod(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const paymentMethodId = req.params.id;

        try {
            await this.paymentService.setDefaultPaymentMethod(
                userId,
                paymentMethodId
            );
            return res
                .status(200)
                .json({ message: 'Payment method set as default' });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error(
                    'Error setting payment method as default:' + error
                );
                res.status(404).json({ message: error.message });
            }

            this.logger.error(
                'Error setting payment method as default:' + error
            );
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async createRefundRequest(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const orderId = Number(req.params.orderId);
        const { userId } = req.user as JwtPayload;
        const { reason, amount } = req.body;

        try {
            const created = await this.paymentService.createRefundRequest(
                userId,
                orderId,
                reason,
                amount
            );
            return res.status(200).json({
                message: created
                    ? 'Refund Request created successfully'
                    : 'Order refunded successfully',
            });
        } catch (error) {
            if (
                error instanceof UserNotFoundError ||
                error instanceof OrderNotFoundError
            ) {
                this.logger.error('Error creating refund request:' + error);
                res.status(404).json({ message: error.message });
            }

            this.logger.error('Error creating refund request:' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPaymentMethods(req: Request, res: Response) {
        const { userId } = req.user as JwtPayload;

        try {
            const paymentMethods =
                await this.paymentService.getPaymentMethods(userId);

            return res.status(200).json({ paymentMethods });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error retrieving payment methods: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error retrieving payment methods: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPaymentMethodById(req: Request, res: Response) {
        const { userId } = req.user as JwtPayload;
        const paymentMethodId: string = req.params.id;

        try {
            const paymentMethod =
                await this.paymentService.getPaymentMethodById(
                    userId,
                    paymentMethodId
                );

            return res.status(200).json({ paymentMethod });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error retrieving payment method: ' + error);
                return res.status(404).json({ message: error.message });
            }
            if (
                error instanceof Stripe.errors.StripeInvalidRequestError &&
                error.statusCode === 404
            ) {
                this.logger.error('Error retrieving payment method: ' + error);
                return res
                    .status(404)
                    .json({ message: 'Payment method not found' });
            }

            this.logger.error('Error retrieving payment method: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updatePaymentMethod(req: Request, res: Response) {
        const { userId } = req.user as JwtPayload;
        const paymentMethodId: string = req.params.id;
        const { expMonth, expYear } = req.body;

        try {
            const paymentMethod = await this.paymentService.updatePaymentMethod(
                userId,
                paymentMethodId,
                expMonth,
                expYear
            );
            return res.status(200).json({ paymentMethod });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error updating payment method: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error updating payment method: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deletePaymentMethod(req: Request, res: Response) {
        const { userId } = req.user as JwtPayload;
        const paymentMethodId: string = req.params.id;

        try {
            await this.paymentService.deletePaymentMethod(
                userId,
                paymentMethodId
            );
            return res.sendStatus(204);
        } catch (error) {
            if (
                error instanceof Stripe.errors.StripeInvalidRequestError &&
                error.statusCode === 404
            ) {
                this.logger.error('Error deleting payment method: ' + error);
                return res
                    .status(404)
                    .json({ message: 'Payment method not found' });
            }

            this.logger.error('Error deleting payment method: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async processPaymentAndCreateOrder(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;
        const data = req.body;

        try {
            await this.paymentService.processPaymentAndCreateOrder(
                userId,
                data
            );

            return res
                .status(200)
                .json({ message: 'Order created successfully' });
        } catch (error) {
            if (
                error instanceof UserNotFoundError ||
                error instanceof ProductNotFoundError
            ) {
                this.logger.error('Error processing payment: ' + error);
                return res.status(404).json({ message: error.message });
            }
            this.logger.error('Error processing payment: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerRefundRequests(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { userId } = req.user as JwtPayload;

        try {
            const refundRequests =
                await this.paymentService.getCustomerRefundRequests(userId);
            return res.status(200).json({ refundRequests });
        } catch (error) {
            this.logger.error(
                'Error retrieving customer refund requests: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getRefundRequests(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { customerId, status } = req.query;

        try {
            const { total, requests } =
                await this.paymentService.getRefundRequests({
                    customerId: customerId ? Number(customerId) : undefined,
                    status: status as 'pending' | 'approved' | 'denied',
                });
            return res.status(200).json({ total, requests });
        } catch (error) {
            this.logger.error('Error retrieving refund requests: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async handleRefundRequest(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const refundRequestId = Number(req.params.id);
        const { action, rejectionReason } = req.body;

        try {
            await this.paymentService.handleRefundRequest(
                refundRequestId,
                action,
                rejectionReason
            );
            return res.sendStatus(200);
        } catch (error) {
            this.logger.error('Error handling refund requests: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
