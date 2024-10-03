export class ProductNotFoundError extends Error {
    constructor(message: string = 'Product not found') {
        super(message);
        this.name = 'ProductNotFoundError';
    }
}

export class ProductOutOfStockError extends Error {
    constructor() {
        super('Product is out of stock');
        this.name = 'ProductOutOfStockError';
    }
}

export class ProductAlreadyExistsError extends Error {
    constructor(message: string = 'Product already exists') {
        super(message);
        this.name = 'ProductAlreadyExistsError';
    }
}

export class InvalidStockStatusError extends Error {
    constructor(status: string) {
        super(`Invalid stock status "${status}"`);
        this.name = 'InvalidStockStatusError';
    }
}
