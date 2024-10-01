export class AdminLogCreationError extends Error {
    constructor(message = 'Failed to create admin log') {
        super(message);
        this.name = 'AdminLogCreationError';
    }
}

export class AdminLogInvalidTargetError extends Error {
    constructor(target: string) {
        super('Invalid target: ' + target);
        this.name = 'AdminLogInvalidTarget';
    }
}
