import { AdminService, PaymentService } from '@/services';
import type { Model, ModelStatic } from 'sequelize';
import type {
    Admin,
    Courier,
    SupportAgent,
    Customer,
} from '@/models/relational';
import type { UserCreationDetails } from '@/types';

type UserType = Admin | Courier | SupportAgent | Customer;

class TestableAdminService extends AdminService {
    public override async userFactory<T extends Model>(
        userClass: ModelStatic<T>,
        details: UserCreationDetails
    ): Promise<T> {
        return super.userFactory(userClass, details);
    }

    public exposedPaymentService = this.paymentService;
}

describe('AdminService', () => {
    const paymentService = new PaymentService('abc');
    const adminService = new TestableAdminService(paymentService);

    const mockGenericUser: UserCreationDetails = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'john.doe',
        birthday: new Date(),
        password: 'password123',
    };
    const constructedGenericUser: Partial<UserType> = {
        userId: 1,
        ...mockGenericUser,
        save: jest.fn(),
    };

    jest.spyOn(adminService, 'userFactory').mockResolvedValue(
        constructedGenericUser as unknown as UserType
    );

    describe('registerCustomer', () => {
        it('should register a new customer', async () => {
            await adminService.registerCustomer(mockGenericUser);

            expect(
                adminService.exposedPaymentService!.createCustomer
            ).toHaveBeenCalledWith('John Doe', 'john@example.com');

            expect(constructedGenericUser.save).toHaveBeenCalled();
        });
    });
});
