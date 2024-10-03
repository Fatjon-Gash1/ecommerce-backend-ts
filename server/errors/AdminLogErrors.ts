export class AdminLogInvalidTargetError extends Error {
    constructor(target: string) {
        super('Invalid target: ' + target);
        this.name = 'AdminLogInvalidTarget';
    }
}
