export class AdminLogInvalidTargetError extends Error {
    constructor(target: string) {
        super('Could not log admin operation. Invalid target: ' + target);
        this.name = 'AdminLogInvalidTarget';
    }
}
