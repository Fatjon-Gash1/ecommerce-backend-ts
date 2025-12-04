export class PaymentService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_apiKey: string) {}

    public createCustomer = jest.fn();
    public deleteCustomer = jest.fn();
    public getCustomerSubscription = jest.fn();
    public hasCanceledSubscriptions = jest.fn();
    public cancelMembershipSubscriptionWithProrate = jest.fn();
    public createMembershipSubscription = jest.fn();
    public retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions =
        jest.fn();
    public updateMembership = jest.fn();
    public createSubscriptionsForCustomers = jest.fn();
}
