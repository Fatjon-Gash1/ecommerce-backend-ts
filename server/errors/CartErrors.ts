export class CartNotFoundError extends Error {
    constructor() {
        super('Cart not found');
        this.name = 'CartNotFoundError';
    }
}

export class CartItemNotFoundError extends Error {
    constructor(message: string = 'Cart item not found') {
        super(message);
        this.name = 'CartItemNotFoundError';
    }
}

export class CartUpdateError extends Error {
    constructor() {
        super('Failed to update cart');
        this.name = 'CartUpdateError';
    }
}

export class EmptyCartError extends Error {
    constructor() {
        super('Cart is empty');
        this.name = 'EmptyCartError';
    }
}

export class CartItemAdditionError extends Error {
    constructor() {
        super('Failed to add item to cart');
        this.name = 'CartItemCreationError';
    }
}
