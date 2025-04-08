import { User, Admin, AdminLog } from '@/models/relational';
import { PlatformLog } from '@/models/document';
import { AdminLogInvalidTargetError, UserNotFoundError } from '@/errors';
import { adminNamespace } from '@/socket/admin';
import { AdminLogResponse, PlatformLogResponse } from '@/types';

/**
 * Service responsible for platform logs.
 */
export class LoggingService {
    /**
     * Logs different administrative operations.
     *
     * @param username - The username of the user performing the action
     * @param target - The type of entity being acted upon
     * @param operation - The action performed
     * @returns A promise that resolves to void
     *
     * @throws {@link UserNotFoundError}
     * Thrown if the admin is not found.
     *
     * @throws {@link AdminLogInvalidTargetError}
     * Thrown if the provided target is not valid
     *
     * @throws {@link AdminLogCreationError}
     * Thrown if the log cannot be created
     */
    public async logOperation(
        username: string,
        target: string,
        operation: string = 'create'
    ): Promise<void> {
        const admin = await Admin.findOne({
            include: { model: User, as: 'user', where: { username } },
        });

        if (!admin) {
            throw new UserNotFoundError(
                `Could not log admin "${username}". Admin not found!`
            );
        }

        const categories: string[] = [
            'customer',
            'admin',
            'category',
            'product',
            'membership',
            'order',
            'shipping country',
            'shipping city',
            'shipping weight',
            'shipping method',
            'review',
            'rating',
            'sales report',
            'stock report',
            'membership',
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

        const log = await AdminLog.create({
            adminId: admin.id,
            category: target,
            log: `Admin "${username}" ${op} ${target}.`,
        });

        adminNamespace.emit('adminLog', log.toJSON());
    }

    /**
     * Logs different platform events.
     *
     * @param type - The type of event
     * @param message - The message to log
     */
    public async log(type: string, message: string): Promise<void> {
        const log = await PlatformLog.create({ type, message });
        adminNamespace.emit('platformLog', log.toObject());
    }

    /**
     * Retrieves all or filtered administrative logs.
     *
     * @param [category] - The operation category
     * @param [username] - Operation performer
     * @returns A promise resolving to all or filtered administrative logs
     */
    public async getAdminLogs(
        category?: string,
        username?: string
    ): Promise<AdminLogResponse[]> {
        const nestedLoad = {
            attributes: ['id', 'category', 'log', 'createdAt', 'adminId'],
            include: [
                {
                    model: Admin,
                    as: 'admin',
                    attributes: [],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: [],
                            where: { username },
                        },
                    ],
                },
            ],
        };

        if (category && username) {
            const logs = await AdminLog.findAll({
                where: { category },
                ...nestedLoad,
            });
            return logs.map((log) => log.toJSON());
        } else if (category) {
            const logs = await AdminLog.findAll({
                where: { category },
            });
            return logs.map((log) => log.toJSON());
        } else if (username) {
            const logs = await AdminLog.findAll(nestedLoad);
            return logs.map((log) => log.toJSON());
        } else {
            const logs = await AdminLog.findAll();
            return logs.map((log) => log.toJSON());
        }
    }

    /**
     * Retrieves all or filtered platform logs.
     *
     * @param [type] - The type of the event
     * @returns A promise resolving to all or filtered platform logs
     */
    public async getPlatformLogs(
        type?: string
    ): Promise<PlatformLogResponse[]> {
        const logs = await PlatformLog.find(type ? { type } : {}).select(
            '-__t -__v'
        );

        return logs.map((log) => log.toObject());
    }
}
