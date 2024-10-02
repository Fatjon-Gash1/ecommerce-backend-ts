import { Request, Response } from 'express';
import { ShippingService } from '../services';
import {
    ShippingLocationNotFoundError,
    ShippingMethodNotFoundError,
    EmptyCartError,
    CartNotFoundError,
} from '../errors';

export class ShippingController {
    shippingService: ShippingService;

    constructor(shippingService: ShippingService) {
        this.shippingService = shippingService;
    }

    public async addNewCountry(req: Request, res: Response): Promise<void> {
        const { name, rate } = req.body;

        try {
            const country = await this.shippingService.addNewCountry(
                name,
                rate
            );
            res.status(200).json({
                message: 'Country added successfully',
                country,
            });
        } catch (error) {
            console.error('Error adding new country: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async addCityToCountry(req: Request, res: Response): Promise<void> {
        const countryId: number = Number(req.params.id);
        const { name, postalCode } = req.body;

        try {
            const city = await this.shippingService.addCityToCountry(
                countryId,
                name,
                postalCode
            );
            res.status(200).json({ message: 'City added successfully', city });
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                console.error('Error adding city: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error adding city: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getShippingCountries(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const shippingCountries =
                await this.shippingService.getShippingCountries();
            res.status(200).json({ shippingCountries });
        } catch (error) {
            console.error('Error getting shipping countries: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getShippingCitiesByCountry(
        req: Request,
        res: Response
    ): Promise<void> {
        const countryId: number = Number(req.params.id);

        try {
            const shippingCities =
                await this.shippingService.getShippingCitiesByCountry(
                    countryId
                );
            res.status(200).json({ shippingCities });
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                console.error('Error getting shipping cities: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting shipping cities: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateShippingCountry(
        req: Request,
        res: Response
    ): Promise<void> {
        const countryId: number = Number(req.params.id);
        const { name, rate } = req.body;

        try {
            const updatedCountry =
                await this.shippingService.updateShippingCountry(
                    countryId,
                    name,
                    rate
                );
            res.status(200).json({
                message: 'Country updated successfully',
                updatedCountry,
            });
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                console.error('Error updating country: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error updating country: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateShippingCity(
        req: Request,
        res: Response
    ): Promise<void> {
        const cityId: number = Number(req.params.id);
        const { name, postalCode } = req.body;

        try {
            const updatedCity = await this.shippingService.updateShippingCity(
                cityId,
                name,
                postalCode
            );
            res.status(200).json({
                message: 'City updated successfully',
                updatedCity,
            });
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                console.error('Error updating city: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error updating city: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteShippingCountry(
        req: Request,
        res: Response
    ): Promise<void> {
        const countryId: number = Number(req.params.id);

        try {
            await this.shippingService.deleteShippingCountry(countryId);
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                console.error('Error deleting country: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error deleting country: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteShippingCity(
        req: Request,
        res: Response
    ): Promise<void> {
        const cityId: number = Number(req.params.id);

        try {
            await this.shippingService.deleteShippingCity(cityId);
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                console.error('Error deleting city: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error deleting city: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async changeShippingWeightRate(
        req: Request,
        res: Response
    ): Promise<void> {
        const { type, rate } = req.body;

        try {
            const updatedRate =
                await this.shippingService.changeShippingWeightRate(type, rate);
            res.status(200).json({
                message: 'Shipping weight rate updated successfully',
                updatedRate,
            });
        } catch (error) {
            console.error('Error changing shipping weight rate: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async changeShippingMethodRate(
        req: Request,
        res: Response
    ): Promise<void> {
        const { type, rate } = req.body;

        try {
            const updatedRate =
                await this.shippingService.changeShippingMethodRate(type, rate);
            res.status(200).json({
                message: 'Shipping method rate updated successfully',
                updatedRate,
            });
        } catch (error) {
            console.error('Error changing shipping method rate: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async determineWeightRange(
        req: Request,
        res: Response
    ): Promise<void> {
        const cartId: number = Number(req.params.id);

        try {
            const weight =
                await this.shippingService.determineWeightRange(cartId);
            res.status(200).json({ weight });
        } catch (error) {
            if (error instanceof EmptyCartError) {
                console.error('Error determining weight range: ', error);
                res.status(400).json({ message: error.message });
                return;
            }

            console.error('Error determining weight range: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async calculateShippingCost(
        req: Request,
        res: Response
    ): Promise<void> {
        const cartId: number = Number(req.params.id);
        const { countryName, shippingMethod } = req.body;

        try {
            const shippingCost =
                await this.shippingService.calculateShippingCost(
                    cartId,
                    countryName,
                    shippingMethod
                );
            res.status(200).json({ shippingCost });
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                console.error('Error calculating shipping cost: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            if (error instanceof ShippingLocationNotFoundError) {
                console.error('Error determining weight range: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            if (error instanceof ShippingMethodNotFoundError) {
                console.error('Error determining weight range: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error determining weight range: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
