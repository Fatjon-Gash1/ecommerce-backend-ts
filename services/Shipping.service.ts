import {
    ShippingCountry,
    ShippingCity,
    Cart,
    Customer,
    Product,
    CartItem,
} from '../models/relational';
import { ShippingMethod, ShippingWeight } from '../models/document';
import {
    ShippingLocationNotFoundError,
    ShippingOptionNotFoundError,
    ShippingLocationAlreadyExistsError,
    EmptyCartError,
    CartNotFoundError,
    ProductNotFoundError,
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

interface ProductItem {
    productId: number;
    quantity: number;
}

interface ShippingCostResponse {
    cost: number;
    weightRange: WeightRange;
}

type WeightRange = 'light' | 'standard' | 'heavy';

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
    public async determineWeightRangeForCart(
        userId: number
    ): Promise<WeightRange> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        const cartItems = await CartItem.findAll({
            where: { cartId: cart.id },
            attributes: ['productId', 'quantity'],
        }).then((items) =>
            items
                .map((item) => item.toJSON())
                .filter(
                    (item): item is ProductItem => item.productId !== undefined
                )
        );

        if (cartItems.length === 0) {
            throw new EmptyCartError();
        }

        return await this.determineWeightRange(cartItems);
    }

    /**
     * Determines the order items weight range.
     *
     * @param productItems - The product items. Either cart items or order items
     * @returns A promise that resolves to a string representing the weight range
     */
    public async determineWeightRange(
        productItems: ProductItem[]
    ): Promise<WeightRange> {
        const orderWeight = await Promise.all(
            productItems.map(async (item) => {
                const product = await Product.findByPk(item.productId, {
                    attributes: ['weight'],
                });

                if (!product) {
                    throw new ProductNotFoundError();
                }

                return product.weight * item.quantity;
            })
        ).then((weights) => weights.reduce((acc, weight) => acc + weight, 0));

        return orderWeight > 20
            ? 'heavy'
            : orderWeight > 10
              ? 'standard'
              : 'light';
    }

    /**
     * Performs the calculation of shipping cost based on the provided parameters.
     *
     * @param countryName - The name of the shipping country
     * @param shippingMethod - The type of the shipping method
     * @param [userId] - The id of the user
     * @returns A promise that resolves to the calculated shipping cost and the weight range
     *
     * @throws {@link ShippingLocationNotFoundError}
     * Thrown if the provided shipping country is not found.
     *
     * @throws {@link ShippingOptionNotFoundError}
     * Thrown if the provided shipping method or weight is not found.
     */
    public async calculateShippingCost(
        countryName: string,
        shippingMethod: string, // next-day for replenishment
        userId?: number,
        orderItems?: ProductItem[]
    ): Promise<ShippingCostResponse> {
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

        const weightRange: WeightRange = orderItems
            ? await this.determineWeightRange(orderItems)
            : await this.determineWeightRangeForCart(userId!);

        const weightResult = await ShippingWeight.findOne({
            weight: weightRange,
        }); // ODM Model

        if (!weightResult) {
            throw new ShippingOptionNotFoundError('Shipping weight not found');
        }

        const cost: number = parseFloat(
            (country.rate + method.rate + weightResult.rate).toFixed(2)
        );

        return {
            cost,
            weightRange,
        };
    }
}
