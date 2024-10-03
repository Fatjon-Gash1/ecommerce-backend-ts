export class NotificationError extends Error {
    constructor(message: string = 'Failed to send notification') {
        super(message);
        this.name = 'NotificationError';
    }
}

export class EmailNotificationError extends Error {
    constructor(message: string = 'Failed to send email') {
        super(message);
        this.name = 'EmailNotificationError';
    }
}
