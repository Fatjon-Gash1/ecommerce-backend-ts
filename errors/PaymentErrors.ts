export class PaymentFailedError extends Error {
    constructor() {
        super('Payment failed');
        this.name = 'PaymentFailedError';
    }
}

export class InvalidPaymentMethodError extends Error {
    constructor() {
        super('Invalid payment method');
        this.name = 'InvalidPaymentMethodError';
    }
}

export class InsufficientFundsError extends Error {
    constructor() {
        super('Insufficient funds');
        this.name = 'InsufficientFundsError';
    }
}
