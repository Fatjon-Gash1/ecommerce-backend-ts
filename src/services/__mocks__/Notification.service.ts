export class NotificationService {
    constructor() {}

    public sendEmailVerificationEmail = jest.fn();
    public sendWelcomeEmail = jest.fn();
    public sendPasswordResetEmail = jest.fn();
    public sendHandledRefundEmail = jest.fn();
    public markAsRead = jest.fn();
    public sendNotification = jest.fn();
    public removeNotification = jest.fn();
    public sendMembershipDiscountEmailToNonSubscribers = jest.fn();
    public sendEmailOnMembershipPriceIncrease = jest.fn();
}
