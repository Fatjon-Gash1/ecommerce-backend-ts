export class ReportNotFoundError extends Error {
    constructor(message: string = 'Report not found.') {
        super(message);
        this.name = 'ReportNotFoundError';
    }
}
