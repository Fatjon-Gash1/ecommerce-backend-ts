import {
    ShippingCountry,
    ShippingCity,
    Cart,
    Customer,
} from '../models/relational';
import { ShippingMethod, ShippingWeight } from '../models/document';
import {
    ShippingLocationNotFoundError,
    ShippingOptionNotFoundError,
    ShippingLocationAlreadyExistsError,
    EmptyCartError,
    CartNotFoundError,
} from '../errors';

interface ShippingCountryResponse {
    id?: number;
    name: string;
    rate: number;
}

interface ShippingCityResponse {
    id?: number;
    name: string;
    postalCode: number;
}

interface ShippingMethodResponse {
    id?: number;
    method: string;
    rate: number;
}

interface ShippingWeightResponse {
    id?: number;
    weight: string;
    rate: number;
}

/**
 * Service responsible for shipping-related operations
 */
export class ShippingService {
    /**
     * Adds a country to the Shipping Countries.
     *
     * @param name - Country name
     * @param rate - Shipping rate
     * @returns A promise that resolves to the created country
     */
    public async addShippingCountry(
        name: string,
        rate: number
    ): Promise<ShippingCountryResponse> {
        const [country, created] = await ShippingCountry.findOrCreate({
            where: { name },
            defaults: { name, rate },
        });

        if (!created) {
            throw new ShippingLocationAlreadyExistsError('country');
        }

        return country.toJSON();
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
    ): Promise<ShippingCityResponse> {
        const country = await ShippingCountry.findByPk(countryId);

        if (!country) {
            throw new ShippingLocationNotFoundError('country');
        }

        const [city, created] = await ShippingCity.findOrCreate({
            where: { name },
            defaults: { countryId, name, postalCode },
        });

        if (!created) {
            throw new ShippingLocationAlreadyExistsError('city');
        }

        delete city.dataValues.countryId;
        return city.toJSON();
    }

    /**
     * Returns all shipping countries.
     *
     * @returns A promise that resolves to an array of shipping countries
     */
    public async getShippingCountries(): Promise<ShippingCountryResponse[]> {
        const countries = await ShippingCountry.findAll();

        return countries.map((country) => country.toJSON());
    }

    /**
     * Returns all shipping cities of a shipping country.
     *
     * @param countryId - Country ID
     * @returns A promise that resolves to an array of shipping cities
     */
    public async getShippingCitiesByCountryId(
        countryId: number
    ): Promise<ShippingCityResponse[]> {
        const country = await ShippingCountry.findByPk(countryId);

        if (!country) {
            throw new ShippingLocationNotFoundError('country');
        }

        const cities = await ShippingCity.findAll({
            where: { countryId },
            attributes: ['id', 'name', 'postalCode'],
        });

        return cities.map((city) => city.toJSON());
    }

    /**
     * Updates a shipping country.
     *
     * @param countryId - Country id
     * @param name - Country name
     * @param rate - Shipping rate
     * @returns A promise that resolves to the updated country
     */
    public async updateShippingCountry(
        countryId: number,
        name: string,
        rate: number
    ): Promise<ShippingCountryResponse> {
        const country = await ShippingCountry.findByPk(countryId);

        if (!country) {
            throw new ShippingLocationNotFoundError('country');
        }

        await country.update({ name, rate });

        return country.toJSON();
    }

    /**
     * Updates a shipping city.
     *
     * @param cityId - City id
     * @param name - City name
     * @param postalCode - Postal code
     * @returns A promise that resolves to the updated city
     */
    public async updateShippingCity(
        cityId: number,
        name: string,
        postalCode: number
    ): Promise<ShippingCityResponse> {
        const city = await ShippingCity.findByPk(cityId, {
            attributes: { exclude: ['countryId'] },
        });

        if (!city) {
            throw new ShippingLocationNotFoundError('city');
        }

        await city.update({ name, postalCode });

        return city.toJSON();
    }

    /**
     * Deletes a shipping country.
     *
     * @param countryId - Country id
     * @returns A promise that resolves to a boolean value indicating
     * whether the country was deleted
     */
    public async deleteShippingCountry(countryId: number): Promise<void> {
        const deleted = await ShippingCountry.destroy({
            where: { id: countryId },
        });

        if (deleted === 0) {
            throw new ShippingLocationNotFoundError('country');
        }
    }

    /**
     * Deletes a shipping city.
     *
     * @param cityId - City id
     * @returns A promise that resolves to a boolean value indicating
     * whether the city was deleted
     */
    public async deleteShippingCity(cityId: number): Promise<void> {
        const deleted = await ShippingCity.destroy({
            where: { id: cityId },
        });

        if (deleted === 0) {
            throw new ShippingLocationNotFoundError('city');
        }
    }

    /**
     * Changes the shipping method rate.
     *
     * @param method - Shipping method
     * @param rate - The new shipping method rate
     * @returns A promise that resolves to the updated shipping method rate
     */
    public async changeShippingMethodRate(
        method: string,
        rate: number
    ): Promise<ShippingMethodResponse> {
        const shippingMethod = await ShippingMethod.findOne({ method });

        if (!shippingMethod) {
            throw new ShippingOptionNotFoundError('Shipping method not found');
        }

        shippingMethod.rate = rate;
        await shippingMethod.save();

        return shippingMethod.toObject();
    }

    /**
     * Changes the shipping weight rate.
     *
     * @param weight - Shipping weight
     * @param rate - The new shipping weight rate
     * @returns A promise that resolves to the updated shipping weight rate
     */
    public async changeShippingWeightRate(
        weight: string,
        rate: number
    ): Promise<ShippingWeightResponse> {
        const shippingWeight = await ShippingWeight.findOne({
            weight,
        });

        if (!shippingWeight) {
            throw new ShippingOptionNotFoundError('Shipping weight not found');
        }

        shippingWeight.rate = rate;
        await shippingWeight.save();

        return shippingWeight.toObject();
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
     * @throws {@link CartNotFoundError}
     * Thrown if the user's cart is not found.
     *
     * @throws {@link EmptyCartError}
     * Thrown is the provided cart has no items.
     */
    public async determineWeightRangeForCart(userId: number): Promise<string> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        const products = await cart.getProducts();

        if (products.length === 0) {
            throw new EmptyCartError();
        }

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
     * @param userId - The ID of the user
     * @param countryName - The name of the shipping country
     * @param shippingMethod - The type of the shipping method
     * @returns A promise that resolves to the calculated shipping cost
     *
     * @throws {@link ShippingLocationNotFoundError}
     * Thrown if the provided shipping country is not found.
     *
     * @throws {@link ShippingOptionNotFoundError}
     * Thrown if the provided shipping method or weight is not found.
     */
    public async calculateShippingCost(
        userId: number,
        countryName: string,
        shippingMethod: string
    ): Promise<number> {
        const [country, method] = await Promise.all([
            ShippingCountry.findOne({
                where: { name: countryName.toLowerCase() },
            }),
            ShippingMethod.findOne({ method: shippingMethod.toLowerCase() }), // ODM Model
        ]);

        if (!country) {
            throw new ShippingLocationNotFoundError('country');
        }

        if (!method) {
            throw new ShippingOptionNotFoundError('Shipping method not found');
        }

        const weightRange = await this.determineWeightRangeForCart(userId);
        const weightResult = await ShippingWeight.findOne({
            weight: weightRange,
        }); // ODM Model

        if (!weightResult) {
            throw new ShippingOptionNotFoundError('Shipping weight not found');
        }

        return country.rate + method.rate + weightResult.rate;
    }
}
