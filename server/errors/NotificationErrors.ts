export class NotificationError extends Error {
    constructor(message: string = 'failed to send notification') {
        super(message);
        this.name = 'NotificationError';
    }
}

export class EmailNotificationError extends Error {
    constructor(message: string = 'failed to send email') {
        super(message);
        this.name = 'EmailNotificationError';
    }
}
