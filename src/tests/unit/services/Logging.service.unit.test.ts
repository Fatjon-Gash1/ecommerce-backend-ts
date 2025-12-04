import { LoggingService } from '@/services';
import { Admin, User, AdminLog } from '@/models/relational';
import { AdminLogInvalidTargetError, UserNotFoundError } from '@/errors';
import { adminNamespace } from '@/socket/admin';

describe('LoggingService', () => {
    const loggingService = new LoggingService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('logOperation', () => {
        const mockLogData = {
            username: 'john.doe',
            target: 'product',
            operation: 'create',
        };

        let mockAdminInstance: Partial<Admin>;

        const adminData = {
            user: {},
            id: 1,
        };

        beforeEach(() => {
            mockAdminInstance = {
                save: jest.fn(),
                toJSON: jest.fn().mockReturnValue({
                    ...adminData,
                }),
            } as unknown as Admin;

            (AdminLog.create as jest.Mock).mockResolvedValue({
                toJSON: jest.fn().mockReturnValue({
                    id: 1,
                    adminId: 1,
                    category: 'product',
                    log: `Admin "${mockLogData.username}" created a new ${mockLogData.target.replace('-', ' ')}.`,
                }),
            });
        });

        it('should throw UserNotFoundError if admin is not found', async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                loggingService.logOperation(
                    mockLogData.username,
                    mockLogData.target,
                    mockLogData.operation
                )
            ).rejects.toThrow(UserNotFoundError);

            expect(Admin.findOne).toHaveBeenCalledWith({
                include: {
                    model: User,
                    as: 'user',
                    where: { username: mockLogData.username },
                },
            });
            expect(AdminLog.create).not.toHaveBeenCalled();
        });

        it('should throw AdminLogInvalidTargetError if the provided target is not valid', async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue(mockAdminInstance);

            await expect(
                loggingService.logOperation(
                    mockLogData.username,
                    'unknown-target',
                    mockLogData.operation
                )
            ).rejects.toThrow(AdminLogInvalidTargetError);

            expect(Admin.findOne).toHaveBeenCalledWith({
                include: {
                    model: User,
                    as: 'user',
                    where: { username: mockLogData.username },
                },
            });
            expect(AdminLog.create).not.toHaveBeenCalled();
            expect(adminNamespace.emit).not.toHaveBeenCalled();
        });

        it('should log the administrative operation and emit the log event', async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue(mockAdminInstance);

            await loggingService.logOperation(
                mockLogData.username,
                mockLogData.target,
                mockLogData.operation
            );

            expect(Admin.findOne).toHaveBeenCalledWith({
                include: {
                    model: User,
                    as: 'user',
                    where: { username: mockLogData.username },
                },
            });
            expect(AdminLog.create).toHaveBeenCalled();
            expect((adminNamespace.emit as jest.Mock).mock.calls[0][0]).toBe(
                'adminLog'
            );
        });
    });
});
