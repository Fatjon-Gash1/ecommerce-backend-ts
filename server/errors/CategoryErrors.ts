export class CategoryCreationError extends Error {
    constructor(message = 'Failed to create category') {
        super(message);
        this.name = 'CategoryCreationError';
    }
}

export class CategoryNotFoundError extends Error {
    constructor() {
        super('Category not found');
        this.name = 'CategoryNotFoundError';
    }
}

export class InvalidCategoryError extends Error {
    constructor() {
        super('Invalid category');
        this.name = 'InvalidCategoryError';
    }
}
