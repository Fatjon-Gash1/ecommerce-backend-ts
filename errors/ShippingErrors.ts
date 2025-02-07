export class ShippingLocationNotFoundError extends Error {
    constructor(location: string) {
        super(`Shipping ${location} not found`);
        this.name = 'ShippingLocationNotFoundError';
    }
}

export class ShippingOptionNotFoundError extends Error {
    constructor(message = 'Shipping option not found') {
        super(message);
        this.name = 'ShippingMethodNotFoundError';
    }
}

export class ShippingLocationAlreadyExistsError extends Error {
    constructor(location: string) {
        super(`Shipping ${location} already exists`);
        this.name = 'ShippingLocationAlreadyExistsError';
    }
}
