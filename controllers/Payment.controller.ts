import { Request, Response } from 'express';
import { PaymentService } from '../services';
import { JwtPayload } from 'jsonwebtoken';
import { UserNotFoundError } from '../errors';
import Stripe from 'stripe';

export class PaymentController {
    private paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
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
                paymentType as string,
                token as string
            );
            res.status(200).json({
                message: 'Payment details added successfully',
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error adding payment details:', error);
                res.status(404).json({ message: error.message });
            }

            console.error('Error adding payment details:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async createPaymentIntent(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const { amount, currency, paymentMethodId } = req.body;

        try {
            await this.paymentService.createPaymentIntent(
                userId,
                amount,
                currency,
                paymentMethodId
            );

            return res.status(201).json({
                message: 'Payment intent created successfully',
            });
        } catch (err) {
            console.error('Error creating payment intent:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async refundPayment(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const paymentIntentId: string = req.params.id;
        const amount: number = req.body.amount;

        try {
            await this.paymentService.refundPayment(paymentIntentId, amount);
            return res
                .status(200)
                .json({ message: 'Payment intent refunded successfully' });
        } catch (err) {
            console.error('Error retrieving payment intent:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPaymentIntentsForCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;

        try {
            const paymentIntents =
                await this.paymentService.getPaymentIntentsForCustomer(userId);

            return res.status(200).json({ paymentIntents });
        } catch (err) {
            console.error('Error retrieving payment intent:', err);
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
                console.error('Error retrieving payment methods: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error retrieving payment methods: ', error);
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
                console.error('Error retrieving payment method: ', error);
                return res.status(404).json({ message: error.message });
            }
            if (
                error instanceof Stripe.errors.StripeInvalidRequestError &&
                error.statusCode === 404
            ) {
                console.error('Error retrieving payment method: ', error);
                return res
                    .status(404)
                    .json({ message: 'Payment method not found' });
            }

            console.error('Error retrieving payment method: ', error);
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
                console.error('Error updating payment method: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error updating payment method: ', error);
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
                console.error('Error deleting payment method: ', error);
                return res
                    .status(404)
                    .json({ message: 'Payment method not found' });
            }

            console.error('Error deleting payment method: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
