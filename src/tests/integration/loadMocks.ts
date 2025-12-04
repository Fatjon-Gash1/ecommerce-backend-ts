jest.mock('@/socket/admin');
jest.mock('stripe', () => {
    return {
        __esModule: true,
        default: class Stripe {
            secretKey: string;

            constructor(secretKey: string) {
                this.secretKey = secretKey;
            }

            customers = {
                create: jest.fn().mockResolvedValue({ id: 's_123' }),
            };
        },
    };
});
