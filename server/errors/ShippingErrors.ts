export class ShippingLocationCreationError extends Error {
    constructor(message = 'Failed to create shipping country') {
        super(message);
        this.name = 'ShippingLocationCreationError';
    }
}

export class ShippingLocationNotFoundError extends Error {
    constructor(message = 'Shipping country not found') {
        super(message);
        this.name = 'ShippingLocationNotFoundError';
    }
}

export class ShippingLocationUpdateError extends Error {
    constructor(message = 'Failed to update shipping country') {
        super(message);
        this.name = 'ShippingLocationUpdateError';
    }
}

export class ShippingLocationDeletionError extends Error {
    constructor(message = 'Failed to delete shipping country') {
        super(message);
        this.name = 'ShippingLocationDeletionError';
    }
}

export class ShippingRateUpdateError extends Error {
    constructor(message = 'Failed to update shipping rate') {
        super(message);
        this.name = 'ShippingRateUpdateError';
    }
}

export class ShippingMethodNotFoundError extends Error {
    constructor() {
        super('Shipping method not found');
        this.name = 'ShippingMethodNotFoundError';
    }
}
