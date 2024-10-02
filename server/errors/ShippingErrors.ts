export class ShippingLocationNotFoundError extends Error {
    constructor(message = 'Shipping country not found') {
        super(message);
        this.name = 'ShippingLocationNotFoundError';
    }
}

export class ShippingMethodNotFoundError extends Error {
    constructor() {
        super('Shipping method not found');
        this.name = 'ShippingMethodNotFoundError';
    }
}
