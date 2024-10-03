import { User, AdminLog } from '../models/relational';
import { AdminLogInvalidTargetError, UserNotFoundError } from '../errors';

/*
 * Service responsible for logging administrative operations.
 */

export class AdminLogsService {
    /**
     * Logs different administrative operations.
     *
     * @param userId The ID of the user performing the action
     * @param username The username of the user performing the action
     * @param target The type of entity being acted upon
     * @param operation The action performed
     * @returns A promise that resolves to void
     *
     * @throws {@link AdminLogInvalidTargetError}
     * thrown if the provided target is not valid
     * @throws {@link AdminLogCreationError}
     * thrown if the log cannot be created
     */
    public async log(
        username: string,
        target: string,
        operation: string = 'create'
    ): Promise<void> {
        const admin = await User.findOne({ where: { username } });

        if (!admin) {
            throw new UserNotFoundError();
        }

        const categoryMap: { [key: string]: string } = {
            customer: 'customer',
            admin: 'admin',
            category: 'category',
            subcategory: 'subcategory',
            product: 'product',
            country: 'shipping country',
            city: 'shipping city',
            'shipping weight': 'shipping weight rate',
            'shipping method': 'shipping method rate',
            review: 'review',
            rating: 'rating',
            report: 'report',
        };

        const category = categoryMap[target];
        if (!category) {
            throw new AdminLogInvalidTargetError(`${target}`);
        }

        const opMap: { [key: string]: string } = {
            create: 'created a new',
            update: 'updated an existing',
            delete: 'deleted an existing',
        };

        const op = opMap[operation];

        await AdminLog.create({
            adminId: admin.id,
            category,
            log: `Admin "${username}" ${op} ${target}.`,
        });
    }
}
