import { PlatformData } from '@/models/document';
import { Admin, Customer, User } from '@/models/relational';
import { PlatformDataObject, PlatformDataResponse, UserType } from '@/types';

/**
 * Service responsible only for retrieval and modification of platform data
 */
export class PlatformDataService {
    /**
     * Updates the platform data.
     *
     * @param id - The id of the platform data to update
     * @param data - The new platform data
     * @returns A promise that resolves to the updated platform data
     *
     * @throws {@link Error}
     * Thrown if the platform data is not found.
     */
    public async updatePlatformData(
        id: string,
        data: PlatformDataObject
    ): Promise<PlatformDataResponse> {
        const platformData = await PlatformData.findByIdAndUpdate(id, data, {
            new: true,
        })
            .select('-__t -__v')
            .lean<PlatformDataResponse>();

        if (!platformData) {
            throw new Error('Platform data not found');
        }

        return platformData;
    }

    /**
     * Retrieves the platform data.
     *
     * @returns A promise that resolves to the platform data
     */
    public async getPlatformData(): Promise<PlatformDataResponse> {
        const platformData = (
            await PlatformData.find({})
                .select('-__t -__v')
                .lean<PlatformDataResponse[]>()
        )[0];

        return platformData;
    }

    /**
     * Retrieves the number of active users of a given type.
     *
     * @param type - The type of user ('admin', 'manager', 'customer')
     * @returns A promise resolving to the number of active users
     */
    public async getActiveUsers(type: UserType): Promise<number> {
        const filteringObject = {
            include: {
                model: User,
                as: 'user',
                where: { isActive: true },
                attributes: [],
            },
            attributes: [],
        };

        switch (type) {
            case 'customer':
                return await Customer.count(filteringObject);
            case 'admin':
                return await Admin.count(filteringObject);
            case 'manager':
                return await Admin.count({
                    include: {
                        model: User,
                        as: 'user',
                        where: { isActive: true, role: 'manager' },
                        attributes: [],
                    },
                    attributes: [],
                });
            default:
                throw new Error('Invalid type');
        }
    }
}
