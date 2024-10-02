export class CategoryAlreadyExistsError extends Error {
    constructor(message = 'Category already exists') {
        super(message);
        this.name = 'CategoryAlreadyExistsError';
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
