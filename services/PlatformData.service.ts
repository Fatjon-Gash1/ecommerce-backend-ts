import { PlatformData } from '../models/document';

interface PlatformData {
    companyName: string;
    headquartersAddress: string;
    customerSupportEmail: string;
    customerSupportPhoneNumber: string;
    operatingHours: string;
    faq: Faq[];
}

interface Faq {
    question: string;
    answer: string;
}

interface PlatformDataResponse extends PlatformData {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

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
        data: PlatformData
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
}
