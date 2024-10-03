export class RatingNotFoundError extends Error {
    constructor(message = 'Rating not found') {
        super(message);
        this.name = 'RatingNotFoundError';
    }
}
