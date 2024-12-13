import Stripe from 'stripe';
import { Customer, Payment, User } from '../models/relational';
import dotenv from 'dotenv';
import { UserNotFoundError } from '../errors';

dotenv.config();

export class PaymentService {
    private stripe: Stripe;

    constructor(stripeKey: string) {
        this.stripe = new Stripe(stripeKey);
    }

    /**
     * Create a new stripe customer if one is not found.
     *
     * @param customerId - The id of the customer model to look upp.
     * @returns A Promise resolving to the found/created customer object.
     *
     * @throws {Error}
     * Thrown if it fails to create/find the customer.
     */
    async createCustomer(name: string, email: string): Promise<string> {
        const stripeCustomer = await this.stripe.customers.create({
            name,
            email,
        });

        return stripeCustomer.id;
    }

    /**
     * Create a payment intent using the Stripe API.
     *
     * @param amount - The amount to charge (in smallest currency unit, such as cents).
     * @param currency - Currency for the payment, 'usd' or 'eur'.
     * @param description - Payment description.
     * @returns A Promise resolving to the created payment intent object.
     *
     * @throws {Error}
     * Thrown if it fails to create the payment intent.
     */
    async createPaymentIntent(
        amount: number,
        currency: 'usd' | 'eur' = 'eur',
        description: string
    ): Promise<Stripe.PaymentIntent> {
        if (!amount || amount <= 0) {
            throw new Error(
                'Invalid amount provided. It should be a positive number.'
            );
        }

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amount * 100, // Convert amount to cents (or lowest unit)
                currency,
                description,
                automatic_payment_methods: { enabled: true },
            });

            // Store the payment intent details in payment model
            await Payment.create({
                stripeId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency,
                description,
            });

            return paymentIntent;
        } catch (err) {
            if (err instanceof Stripe.errors.StripeError) {
                console.error(
                    'Stripe error creating payment intent (From Service):',
                    err
                );
                throw new Error(`Payment creation failed: ${err.message}`);
            } else {
                console.error('Unknown error creating payment intent:', err);
                throw new Error(
                    'Failed to create payment intent. Unknown cause.'
                );
            }
        }
    }

    /**
     * Retrieve a payment intent by its ID.
     *
     * @param paymentIntentId - The ID of the payment intent to retrieve.
     * @returns A Promise resolving to the retrieved payment intent.
     *
     * @throws {Error}
     * Thrown if it fails to retrieve the payment intent.
     */
    async retrievePaymentIntent(
        paymentIntentId: string
    ): Promise<Stripe.PaymentIntent> {
        try {
            const paymentIntent =
                await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (err) {
            if (err instanceof Stripe.errors.StripeError) {
                console.error('Stripe error retrieving payment intent:', err);
                throw new Error(
                    `Failed to retrieve payment intent: ${err.message}`
                );
            } else {
                console.error('Unknown error retrieving payment intent:', err);
                throw new Error(
                    'Failed to retrieve payment intent. Unknown cause.'
                );
            }
        }
    }
} // Service currently on hold. Additional methods will be added...
