import { Request, Response } from 'express';
import { PaymentService } from '../services';
import { UserNotFoundError } from '../errors';

export class PaymentController {
    private paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    public async findOrCreateCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        //const customerId = Number(req.params.id);

        try {
            /*const { created, customer } =
                await this.paymentService.findOrCreateCustomer(customerId);

            return res
                .status(200)
                .json(
                    created
                        ? { newCustomer: true, customer }
                        : { newCustomer: false, customer }
                );*/
            return res.sendStatus(200);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error finding or creating customer:', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error finding or creating customer:', error);
            return res.status(500).json({ message: 'Server error' });
        }
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
                    .json({ success: false, message: 'Server error' });
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
                    .json({ success: false, message: 'Server error' });
            }
        }
    }
}
