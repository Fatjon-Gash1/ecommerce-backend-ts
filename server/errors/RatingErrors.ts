export class RatingCreationError extends Error {
    constructor(message = 'e') {
        super(message);
        this.name = 'RatingCreationError';
    }
}

export class RatingNotFoundError extends Error {
    constructor(message = 'Rating not found') {
        super(message);
        this.name = 'RatingNotFoundError';
    }
}

export class RatingUpdateError extends Error {
    constructor(message = 'Rating update error') {
        super(message);
        this.name = 'RatingUpdateError';
    }
}
