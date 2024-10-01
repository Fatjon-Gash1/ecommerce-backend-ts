import { AdminLog } from '../models/relational';
import { AdminLogCreationError, AdminLogInvalidTargetError } from '../errors';

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
        userId: number,
        username: string,
        target: string,
        operation: string = 'create'
    ): Promise<void> {
        const categoryMap: { [key: string]: string } = {
            customer: 'user',
            admin: 'user',
            category: 'category',
            subcategory: 'category',
            product: 'product',
            review: 'rating',
            report: 'analytics',
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

        try {
            await AdminLog.create({
                adminId: userId,
                category,
                log: `Admin "${username}" ${op} ${target}.`,
            });
        } catch (err) {
            console.error('Error creating admin log:', err);
            throw new AdminLogCreationError();
        }
    }
}
