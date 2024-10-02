export class OrderNotFoundError extends Error {
    constructor(message: string = 'Order not found') {
        super(message);
        this.name = 'OrderNotFoundError';
    }
}
