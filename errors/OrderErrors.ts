export class OrderNotFoundError extends Error {
    constructor(message: string = 'Order not found') {
        super(message);
        this.name = 'OrderNotFoundError';
    }
}

export class OrderAlreadyMarkedError extends Error {
    constructor(message: string = 'Order is already marked') {
        super(message);
        this.name = 'OrderAlreadyMarkedError';
    }
}
