import Stripe from 'stripe';
import { Customer } from '../models/relational';
import dotenv from 'dotenv';
import { UserNotFoundError } from '../errors';

dotenv.config();

type PaymentMethod =
    | 'acss_debit'
    | 'amazon_pay'
    | 'card'
    | 'cashapp'
    | 'customer_balance'
    | 'paypal'
    | 'us_bank_account';

interface PaymentMethodResponse {
    id: string;
    type: string;
    card?: CardPaymentMethod;
    created: number;
}

interface CardPaymentMethod {
    brand?: string;
    country?: string | null;
    exp_month?: number;
    exp_year?: number;
    funding?: string;
    last4?: string;
}

interface SetupIntentResponse {
    customer: string;
    payment_method: string;
}

interface StripePriceIds {
    monthlyPriceId?: string;
    annualPriceId?: string;
}

interface MembershipSubscribeDetails {
    currency: string;
    stripeMonthlyPriceId: string;
    discountable: boolean;
    hasTrial: boolean;
}

interface ProductDetails {
    name: string;
    currency: string;
    price: number;
}

export class PaymentService {
    private stripe: Stripe;

    constructor(stripeKey: string) {
        this.stripe = new Stripe(stripeKey);
    }

    /**
     * Creates a new stripe customer.
     *
     * @param name - Name of the customer
     * @param email - Email of the customer
     * @returns A Promise resolving to the Stripe customer id
     */
    public async createCustomer(name: string, email: string): Promise<string> {
        const stripeCustomer = await this.stripe.customers.create({
            name,
            email,
        });

        return stripeCustomer.id;
    }

    public async createPaymentMethod(
        type: string,
        token: string
    ): Promise<string> {
        const paymentMethod = await this.stripe.paymentMethods.create({
            type: type as PaymentMethod,
            [type]: { token },
        });

        return paymentMethod.id;
    }

    public async createSetupIntent(
        customerId: string,
        paymentMethodId: string
    ): Promise<SetupIntentResponse> {
        const setupIntent = await this.stripe.setupIntents.create({
            confirm: true,
            customer: customerId,
            payment_method: paymentMethodId,
            return_url: 'http://localhost:3000/success', // Only for testing
        });

        return {
            customer: setupIntent.customer as string,
            payment_method: setupIntent.payment_method as string,
        };
    }

    public async addPaymentDetails(
        userId: number,
        paymentType: string,
        token: string
    ) {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const paymentMethodId = await this.createPaymentMethod(
            paymentType,
            token
        );

        await this.createSetupIntent(customer.stripeId!, paymentMethodId);

        const setupIntents = await this.stripe.setupIntents.list({
            customer: customer.stripeId,
        });

        if (setupIntents.data.length === 1) {
            await this.stripe.customers.update(customer.stripeId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }
    }

    public async setDefaultPaymentMethod(
        userId: number,
        paymentMethodId: string
    ) {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        await this.stripe.customers.update(customer.stripeId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
    }

    /**
     * Retrieve all customer's payment methods.
     *
     * @param userId - The user id of the customer
     * @returns A promise resolving to an array of payment methods
     */
    public async getPaymentMethods(
        userId: number
    ): Promise<PaymentMethodResponse[]> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const paymentMethods = await this.stripe.customers.listPaymentMethods(
            customer.stripeId!
        );

        return paymentMethods.data.map((pm) => {
            return {
                id: pm.id,
                type: pm.type as PaymentMethod,
                card: {
                    brand: pm.card?.brand,
                    country: pm.card?.country,
                    exp_month: pm.card?.exp_month,
                    exp_year: pm.card?.exp_year,
                    funding: pm.card?.funding,
                    last4: pm.card?.last4,
                },
                created: pm.created,
            };
        });
    }

    /**
     * Retrieves a customer's payment method by its id.
     *
     * @param userId - The user id of the customer
     * @param paymentMethodId - The payment method id to retrieve
     * @returns A promise resolving to the payment method object
     */
    public async getPaymentMethodById(
        userId: number,
        paymentMethodId: string
    ): Promise<PaymentMethodResponse> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const paymentMethod = await this.stripe.customers.retrievePaymentMethod(
            customer.stripeId!,
            paymentMethodId
        );

        return {
            id: paymentMethod.id,
            type: paymentMethod.type as PaymentMethod,
            card: {
                brand: paymentMethod.card?.brand,
                country: paymentMethod.card?.country,
                exp_month: paymentMethod.card?.exp_month,
                exp_year: paymentMethod.card?.exp_year,
                funding: paymentMethod.card?.funding,
                last4: paymentMethod.card?.last4,
            },
            created: paymentMethod.created,
        };
    }

    /**
     * Updates a customer's payment method by its id.
     *
     * @param userId - The user id of the customer
     * @param paymentMethodId - The payment method id to update
     * @param [expMonth] - The card expiration month
     * @param [expYear] - The card expiration year
     * @returns A promise resolving to the updated payment method object
     */
    public async updatePaymentMethod(
        userId: number,
        paymentMethodId: string,
        expMonth?: number,
        expYear?: number
    ): Promise<PaymentMethodResponse> {
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        const paymentMethod = await this.stripe.paymentMethods.update(
            paymentMethodId,
            {
                card: {
                    exp_month: expMonth,
                    exp_year: expYear,
                },
            }
        );

        return {
            id: paymentMethod.id,
            type: paymentMethod.type as PaymentMethod,
            card: {
                brand: paymentMethod.card?.brand,
                country: paymentMethod.card?.country,
                exp_month: paymentMethod.card?.exp_month,
                exp_year: paymentMethod.card?.exp_year,
                funding: paymentMethod.card?.funding,
                last4: paymentMethod.card?.last4,
            },
            created: paymentMethod.created,
        };
    }

    /**
     * Delete (Detach) a payment method from a customer.
     *
     * @param userId - The user id of the customer
     * @param paymentMethodId - The payment method id to delete
     */
    public async deletePaymentMethod(
        userId: number,
        paymentMethodId: string
    ): Promise<void> {
        await this.getPaymentMethodById(userId, paymentMethodId);

        await this.stripe.paymentMethods.detach(paymentMethodId);
    }

    /**
     * Create a payment intent using the Stripe API.
     *
     * @param userId - The user id of the customer
     * @param amount - The amount to charge (in smallest currency unit, such as cents).
     * @param currency - Currency for the payment, 'usd' or 'eur'.
     * @param [paymentMethodId] - The customer's payment method id
     * @returns A Promise resolving to the created payment intent object.
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the user is not found.
     *
     * @throws {Error}
     * Thrown if the stripe customer is deleted.
     */
    public async createPaymentIntent(
        userId: number,
        amount: number,
        currency: 'usd' | 'eur' = 'eur',
        paymentMethodId?: string
    ): Promise<void> {
        let stripeCustomer;
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            throw new UserNotFoundError('Customer not found');
        }

        if (!paymentMethodId) {
            stripeCustomer = await this.stripe.customers.retrieve(
                customer.stripeId
            );
            if (stripeCustomer.deleted) {
                throw new Error('Stripe customer is mistakenly deleted');
            }
        }

        await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            confirm: true,
            currency,
            customer: customer.stripeId,
            payment_method:
                paymentMethodId ??
                stripeCustomer!.invoice_settings.default_payment_method!.toString(),
            return_url: 'http://localhost:3000/success',
        });
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
    public async getPaymentIntentsForCustomer(
        userId: number
    ): Promise<string[]> {
        const customer = await Customer.findOne({ where: { userId } });

        const paymentIntents = await this.stripe.paymentIntents.list({
            customer: customer!.stripeId,
        });

        return paymentIntents.data.map((item) => item.id);
    }

    public async refundPayment(
        paymentIntentId: string,
        amount?: number
    ): Promise<void> {
        await this.stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? amount * 100 : undefined,
        });
    }

    // Used in the product service
    public async createProduct(details: ProductDetails): Promise<{
        productId: string;
        priceId: string;
    }> {
        const newProduct = await this.stripe.products.create({
            name: details.name,
        });

        const priceObj = await this.stripe.prices.create({
            billing_scheme: 'per_unit',
            currency: details.currency,
            product: newProduct.id,
            unit_amount_decimal: String(details.price * 100),
        });

        await this.stripe.products.update(newProduct.id, {
            default_price: priceObj.id,
        });

        return {
            productId: newProduct.id,
            priceId: priceObj.id,
        };
    }

    /**
     * Updates a stripe product along with its related prices.
     *
     * @param productId - The id of the product to update
     * @param monthlyPriceId - The id of the monthly price
     * @param annualPriceId - The id of the annual price
     * @param name - The name of the product
     * @param monthlyPrice - The monthly price of the product
     * @param annualPrice - The annual price of the product
     * @param currency - The currency of the product
     * @returns A promise resolving to the new price id(s)
     */
    public async updateProduct(
        productId: string,
        name: string,
        monthlyPrice: number,
        annualPrice: number,
        currency: string
    ): Promise<StripePriceIds> {
        const priceIds: StripePriceIds = {};

        if (name) {
            await this.stripe.products.update(productId, {
                name,
            });
        }

        if (monthlyPrice) {
            const { id } = await this.stripe.prices.create({
                billing_scheme: 'per_unit',
                currency: currency ? currency : 'eur',
                product: productId,
                recurring: {
                    interval: 'month',
                    interval_count: 1,
                    usage_type: 'licensed',
                },
                unit_amount_decimal: String(monthlyPrice * 100),
            });

            await this.stripe.products.update(productId, {
                default_price: id,
            });

            priceIds.monthlyPriceId = id;
        }

        if (annualPrice) {
            const { id } = await this.stripe.prices.create({
                billing_scheme: 'per_unit',
                currency: currency ? currency : 'eur',
                product: productId,
                recurring: {
                    interval: 'year',
                    interval_count: 1,
                    usage_type: 'licensed',
                },
                unit_amount_decimal: String(annualPrice * 100),
            });

            priceIds.annualPriceId = id;
        }

        return priceIds;
    }

    // Unknown if this will be used
    /**
     * Archives a stripe product.
     *
     * @param stripeProductId - The id of the product to archive
     */
    public async archiveProduct(stripeProductId: string): Promise<void> {
        await this.stripe.products.update(stripeProductId, {
            active: false,
        });
    }

    public async createMembershipSubscription(
        customerId: string,
        membership: MembershipSubscribeDetails,
        promoCode?: string
    ): Promise<void> {
        await this.stripe.subscriptions.create({
            customer: customerId,
            currency: membership.currency,
            items: [
                {
                    price: membership.stripeMonthlyPriceId,
                    quantity: 1,
                },
            ],
            off_session: true,
            proration_behavior: 'none',
            trial_period_days: membership.hasTrial ? 7 : undefined,
            discounts: [
                {
                    promotion_code: membership.discountable
                        ? promoCode
                        : undefined,
                },
            ],
        });
    }
}
