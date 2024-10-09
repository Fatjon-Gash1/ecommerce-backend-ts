import { Request, Response } from 'express';
import { PaymentService } from '../services';

export class PaymentController {
    private paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    public async createPaymentIntent(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { amount, currency, description } = req.body;

        try {
            const paymentIntent = await this.paymentService.createPaymentIntent(
                amount,
                currency,
                description
            );

            return res.status(201).json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            });
        } catch (err) {
            if (err instanceof Error) {
                console.error('Error creating payment intent:', err);
                return res
                    .status(500)
                    .json({ success: false, message: err.message });
            }
        }
    }

    public async getPaymentIntent(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { id } = req.params;

        try {
            const paymentIntent =
                await this.paymentService.retrievePaymentIntent(id);

            return res.status(200).json({ success: true, paymentIntent });
        } catch (err) {
            if (err instanceof Error) {
                console.error('Error retrieving payment intent:', err);
                return res
                    .status(500)
                    .json({ success: false, message: err.message });
            }
        }
    }
}
