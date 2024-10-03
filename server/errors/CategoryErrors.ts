export class CategoryAlreadyExistsError extends Error {
    constructor(message = 'Category already exists') {
        super(message);
        this.name = 'CategoryAlreadyExistsError';
    }
}

export class CategoryNotFoundError extends Error {
    constructor(message = 'Category not found') {
        super(message);
        this.name = 'CategoryNotFoundError';
    }
}

export class InvalidCategoryError extends Error {
    constructor() {
        super('Invalid category');
        this.name = 'InvalidCategoryError';
    }
}
