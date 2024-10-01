import type { Model, ModelStatic, WhereOptions } from 'sequelize';
import {
    ShippingCountry,
    ShippingCity,
    ShippingWeight,
    ShippingMethod,
    CartItem,
    Product,
} from '../models/relational';
import {
    ShippingLocationCreationError,
    ShippingLocationNotFoundError,
    ShippingLocationUpdateError,
    ShippingLocationDeletionError,
    ShippingRateUpdateError,
    ShippingMethodNotFoundError,
    EmptyCartError,
} from '../errors';

/**
 * Service responsible for shipping-related operations
 */
export class ShippingService {
    /**
     * Adds a country to the Shiping Countries.
     *
     * @param name - Country name
     * @param rate - Shipping rate
     * @returns A promise that resolves to the created country
     */
    public async addNewCountry(
        name: string,
        rate: number
    ): Promise<ShippingCountry> {
        const addedCountry = await ShippingCountry.create({ name, rate });

        if (!addedCountry) {
            throw new ShippingLocationCreationError();
        }

        return addedCountry;
    }

    /**
     * Adds a city to a Shipping Country.
     *
     * @param countryId - Country ID
     * @param name - City name
     * @param postalCode - Postal code
     * @returns A promise that resolves to the created city
     */
    public async addCityToCountry(
        countryId: number,
        name: string,
        postalCode: number
    ): Promise<ShippingCity> {
        const country = await ShippingCountry.findByPk(countryId);

        if (!country) {
            throw new ShippingLocationNotFoundError();
        }

        try {
            return await ShippingCity.create({ countryId, name, postalCode });
        } catch (err) {
            if (err instanceof Error) {
                throw new ShippingLocationUpdateError(
                    `Failed to update shipping city: ${err.message}`
                );
            } else {
                throw new ShippingLocationUpdateError(
                    'Failed to update shipping city due to unknown error'
                );
            }
        }
    }

    /**
     * Returns all shipping countries.
     *
     * @returns A promise that resolves to an array of shipping countries
     */
    public async getShippingCountries(): Promise<ShippingCountry[]> {
        return ShippingCountry.findAll();
    }

    /**
     * Returns all shipping cities of a shipping country.
     *
     * @param countryId - Country ID
     * @returns A promise that resolves to an array of shipping cities
     */
    public async getShippingCitiesByCountry(
        countryId: number
    ): Promise<ShippingCity[]> {
        const country = await ShippingCountry.findByPk(countryId);

        if (!country) {
            throw new ShippingLocationNotFoundError();
        }

        try {
            return ShippingCity.findAll({ where: { countryId } });
        } catch (err) {
            if (err instanceof Error) {
                throw new ShippingLocationNotFoundError(
                    `Failed to retrieve shipping cities: ${err.message}`
                );
            }
            throw new Error(
                'Unknown error occurred while retrieving shipping cities'
            );
        }
    }

    /**
     * Updates a shipping country.
     *
     * @param countryId - Country ID
     * @param name - Country name
     * @param rate - Shipping rate
     * @returns A promise that resolves to the updated country
     */
    public async updateShippingCountry(
        countryId: number,
        name: string,
        rate: number
    ): Promise<ShippingCountry> {
        const country = await ShippingCountry.findByPk(countryId);

        if (!country) {
            throw new ShippingLocationNotFoundError();
        }

        country.name = name;
        country.rate = rate;

        try {
            return await country.save();
        } catch (err) {
            if (err instanceof Error) {
                throw new ShippingLocationUpdateError(
                    `Shipping Country update failed: ${err.message}`
                );
            } else {
                throw new ShippingLocationUpdateError(
                    'Failed to update shipping country due to an unknown error.'
                );
            }
        }
    }

    /**
     * Updates a shipping city.
     *
     * @param cityId - City ID
     * @param name - City name
     * @param postalCode - Postal code
     * @returns A promise that resolves to the updated city
     */
    public async updateShippingCity(
        cityId: number,
        name: string,
        postalCode: number
    ): Promise<ShippingCity> {
        const city = await ShippingCity.findByPk(cityId);

        if (!city) {
            throw new ShippingLocationNotFoundError('Shipping City not found');
        }

        city.name = name;
        city.postalCode = postalCode;

        try {
            return await city.save();
        } catch (err) {
            if (err instanceof Error) {
                throw new ShippingLocationUpdateError(
                    `Shipping City update failed: ${err.message}`
                );
            } else {
                throw new ShippingLocationUpdateError(
                    'Failed to update shipping city due to an unknown error.'
                );
            }
        }
    }

    /**
     * Deletes a shipping country.
     *
     * @param countryId - Country ID
     * @returns A promise that resolves to a boolean value indicating
     * whether the country was deleted
     */
    public async deleteShippingCountry(countryId: number): Promise<boolean> {
        try {
            const deleted = await ShippingCountry.destroy({
                where: { id: countryId },
            });

            if (!deleted) {
                throw new ShippingLocationNotFoundError(
                    `Country with Id: "${countryId}" not found or already deleted.`
                );
            }

            return true;
        } catch (err) {
            if (err instanceof Error) {
                throw new ShippingLocationDeletionError(
                    `Failed to delete shipping country: ${err.message}`
                );
            } else {
                throw new ShippingLocationDeletionError(
                    'Failed to delete shipping country due to an unknown error.'
                );
            }
        }
    }

    /**
     * Deletes a shipping city.
     *
     * @param cityId - City ID
     * @returns A promise that resolves to a boolean value indicating
     * whether the city was deleted
     */
    public async deleteShippingCity(cityId: number): Promise<boolean> {
        try {
            const deleted = await ShippingCity.destroy({
                where: { id: cityId },
            });

            if (!deleted) {
                throw new ShippingLocationNotFoundError(
                    `City with Id: "${cityId}" not found or already deleted.`
                );
            }

            return true;
        } catch (err) {
            if (err instanceof Error) {
                throw new ShippingLocationDeletionError(
                    `Failed to delete shipping city: ${err.message}`
                );
            } else {
                throw new ShippingLocationDeletionError(
                    'Failed to delete shipping city due to an unknown error.'
                );
            }
        }
    }

    /**
     * Generic method that changes the shipping rate for the provided model.
     *
     * @param model - The model to perform the update on
     * @param attributeAndType - The shipping attribute and type
     * @param rate - The new shipping rate
     * @returns A promise that resolves to the updated shipping model
     */
    public async changeShippingRate<T extends Model>(
        model: ModelStatic<T>,
        attributeAndType: { key: keyof T; value: string },
        rate: number
    ): Promise<T> {
        const { key, value } = attributeAndType;

        const modelInstance = await model.findOne({
            where: { [key]: value } as WhereOptions<T>,
        });

        try {
            return await modelInstance!.update({ rate });
        } catch (err) {
            if (err instanceof Error) {
                throw new ShippingRateUpdateError(
                    `Shipping rate update failed: ${err.message}`
                );
            } else {
                throw new ShippingRateUpdateError(
                    'Failed to update shipping rate due to an unknown error.'
                );
            }
        }
    }

    /**
     * Utility method that changes the shipping weight rate.
     *
     * @param type - Type of the weight range
     * @param rate - The new shipping weight rate
     * @returns A promise that resolves to the updated shipping weight rate
     */
    public async changeShippingWeightRate(
        type: string,
        rate: number
    ): Promise<ShippingWeight> {
        return await this.changeShippingRate(
            ShippingWeight,
            { key: 'weightRange', value: type },
            rate
        );
    }

    /**
     * Utility method that changes the shipping method rate.
     *
     * @param type - Type of the shipping method
     * @param rate - The new shipping method rate
     * @returns A promise that resolves to the updated shipping method rate
     */
    public async changeShippingMethodRate(
        type: string,
        rate: number
    ): Promise<ShippingMethod> {
        return await this.changeShippingRate(
            ShippingMethod,
            { key: 'shippingMethod', value: type },
            rate
        );
    }

    /**
     * Section regarded to shipping calculations.
     */

    /**
     * Determines the product(s) weight range based on the provided cart items.
     *
     * @param cartId - The ID of the customer cart
     * @returns A promise that resolves to a string representing the weight range
     *
     * @throws {@link EmptyCartError}
     * Thrown is the provided cart has no items.
     */
    public async determineWeightRange(cartId: number): Promise<string> {
        const items = await CartItem.findAll({ where: { cartId } });

        if (items.length === 0) {
            throw new EmptyCartError();
        }

        const productIds = items
            .map((item) => item.productId)
            .filter((id): id is number => id !== undefined);

        const products: Product[] = await Product.findAll({
            where: { id: productIds },
        });

        const isHeavy = products.some((product) => product.weight > 20);
        const isStandard = products.some((product) => product.weight > 1);

        if (isHeavy) {
            return 'heavy';
        }
        if (isStandard) {
            return 'standard';
        }

        return 'light';
    }

    /**
     * Performs the calculation of shipping cost based on the provided parameters.
     *
     * @param cartId - The ID of the customer cart
     * @param countryName - The name of the shipping country
     * @param shippingMethod - The type of the shipping method
     * @returns A promise that resolves to the calculated shipping cost
     *
     * @throws {@link ShippingLocationNotFoundError}
     * Thrown if the provided shipping country is not found.
     *
     * @throws {@link ShippingMethodNotFoundError}
     * Thrown if the provided shipping method is not found.
     */
    public async calculateShippingCost(
        cartId: number,
        countryName: string,
        shippingMethod: string
    ): Promise<number> {
        const [country, method] = await Promise.all([
            ShippingCountry.findOne({ where: { name: countryName } }),
            ShippingMethod.findOne({ where: { shippingMethod } }),
        ]);

        if (!country) {
            throw new ShippingLocationNotFoundError();
        }

        if (!method) {
            throw new ShippingMethodNotFoundError();
        }

        try {
            const weightRange = await this.determineWeightRange(cartId);
            const weightResult = await ShippingWeight.findOne({
                where: { weightRange },
            });

            return country.rate + method.rate + weightResult!.rate;
        } catch (err) {
            if (err instanceof EmptyCartError) {
                console.error('Error calculating shipping cost: ', err);
                throw new EmptyCartError();
            }

            console.error('Error calculating shipping cost: ', err);
            throw new Error(
                'Unknown error occurred while calculating shipping cost'
            );
        }
    }
}
