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

export class InvalidUserTypeError extends Error {
    constructor(message: string = 'Invalid user type') {
        super(message);
        this.name = 'InvalidUserTypeError';
    }
}

export class InvalidAdminRoleError extends Error {
    constructor() {
        super('Invalid admin role');
        this.name = 'InvalidAdminRoleError';
    }
}

export class UnauthorizedAccessError extends Error {
    constructor() {
        super('Unauthorized access');
        this.name = 'UnauthorizedAccessError';
    }
}
