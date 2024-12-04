import { User, Admin, AdminLog } from '../models/relational';
import { AdminLogInvalidTargetError, UserNotFoundError } from '../errors';

/**
 * Service responsible for logging administrative operations.
 */
export class AdminLogsService {
    /**
     * Logs different administrative operations.
     *
     * @param username - The username of the user performing the action
     * @param target - The type of entity being acted upon
     * @param operation - The action performed
     * @returns A promise that resolves to void
     *
     * @throws {@link AdminLogInvalidTargetError}
     * thrown if the provided target is not valid
     *
     * @throws {@link AdminLogCreationError}
     * thrown if the log cannot be created
     */
    public async log(
        username: string,
        target: string,
        operation: string = 'create'
    ): Promise<void> {
        const admin = await Admin.findOne({
            include: { model: User, as: 'user', where: { username } },
        });

        if (!admin) {
            throw new UserNotFoundError(
                `Admin with username: "${username}" not found!`
            );
        }

        const categories: string[] = [
            'customer',
            'admin',
            'category',
            'product',
            'order',
            'shipping country',
            'shipping city',
            'shipping weight',
            'shipping method',
            'review',
            'rating',
            'report',
        ];

        if (!categories.includes(target)) {
            throw new AdminLogInvalidTargetError(target);
        }

        const opMap: { [key: string]: string } = {
            create: 'created a new',
            update: 'updated an existing',
            delete: 'deleted an existing',
        };

        const op = opMap[operation];

        await AdminLog.create({
            adminId: admin.id,
            category: target,
            log: `Admin "${username}" ${op} ${target}.`,
        });
    }
}
