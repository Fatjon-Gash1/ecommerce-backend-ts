export class UserNotFoundError extends Error {
    constructor(message: string = 'User not found') {
        super(message);
        this.name = 'UserNotFoundError';
    }
}

export class UserAlreadyExistsError extends Error {
    constructor() {
        super('User already exists');
        this.name = 'UserAlreadyExistsError';
    }
}

export class InvalidCredentialsError extends Error {
    constructor(message: string = 'Invalid credentials') {
        super(message);
        this.name = 'InvalidCredentialsError';
    }
}

export class UnauthorizedAccessError extends Error {
    constructor() {
        super('Unauthorized access');
        this.name = 'UnauthorizedAccessError';
    }
}
