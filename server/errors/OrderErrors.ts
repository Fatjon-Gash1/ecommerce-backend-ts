export class OrderNotFoundError extends Error {
    constructor(message: string = 'Order not found') {
        super(message);
        this.name = 'OrderNotFoundError';
    }
}

export class InvalidOrderStatusError extends Error {
    constructor(message: string = 'Invalid order status') {
        super(message);
        this.name = 'InvalidOrderStatusError';
    }
}
