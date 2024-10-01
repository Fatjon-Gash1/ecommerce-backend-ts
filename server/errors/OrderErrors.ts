export class OrderNotFoundError extends Error {
    constructor(message: string = 'Order not found') {
        super(message);
        this.name = 'OrderNotFoundError';
    }
}

export class OrderCreationError extends Error {
    constructor() {
        super('Failed to create order');
        this.name = 'OrderCreationError';
    }
}

export class OrderItemNotFoundError extends Error {
    constructor(message: string = 'Order item not found') {
        super(message);
        this.name = 'OrderItemsNotFoundError';
    }
}
