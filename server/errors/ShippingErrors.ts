export class ShippingLocationNotFoundError extends Error {
    constructor(message = 'Shipping country not found') {
        super(message);
        this.name = 'ShippingLocationNotFoundError';
    }
}

export class ShippingOptionNotFoundError extends Error {
    constructor(message = 'Shipping option not found') {
        super(message);
        this.name = 'ShippingMethodNotFoundError';
    }
}
