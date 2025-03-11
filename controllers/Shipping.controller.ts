import { Request, Response } from 'express';
import { ShippingService, AdminLogsService, LoggerService } from '@/services';
import {
    ShippingLocationNotFoundError,
    ShippingOptionNotFoundError,
    EmptyCartError,
    CartNotFoundError,
    UserNotFoundError,
    ShippingLocationAlreadyExistsError,
} from '@/errors';
import { JwtPayload } from 'jsonwebtoken';

export class ShippingController {
    private shippingService: ShippingService;
    private adminLogsService?: AdminLogsService;
    private logger: LoggerService;

    constructor(
        shippingService: ShippingService,
        adminLogsService?: AdminLogsService
    ) {
        this.shippingService = shippingService;
        this.adminLogsService = adminLogsService;
        this.logger = new LoggerService();
    }

    public async addShippingCountry(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;
        const { name, rate } = req.body;

        try {
            const country = await this.shippingService.addShippingCountry(
                name,
                rate
            );
            res.status(200).json({
                message: 'Country added successfully',
                country,
            });

            await this.adminLogsService!.log(
                username,
                'shipping country',
                'create'
            );
        } catch (error) {
            if (error instanceof ShippingLocationAlreadyExistsError) {
                this.logger.error('Error adding new country: ' + error);
                return res.status(400).json({ message: error.message });
            }

            this.logger.error('Error adding new country: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async addCityToCountry(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const countryId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;
        const { name, postalCode } = req.body;

        try {
            const shippingCity = await this.shippingService.addCityToCountry(
                countryId,
                name,
                postalCode
            );

            res.status(200).json({
                message: 'Shipping city added successfully',
                shippingCity,
            });

            await this.adminLogsService!.log(
                username,
                'shipping city',
                'create'
            );
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                this.logger.error('Error adding shipping city: ' + error);
                return res.status(404).json({ message: error.message });
            }
            if (error instanceof ShippingLocationAlreadyExistsError) {
                this.logger.error('Error adding shipping city: ' + error);
                return res.status(400).json({ message: error.message });
            }

            this.logger.error('Error adding shipping city: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getShippingCountries(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const shippingCountries =
                await this.shippingService.getShippingCountries();
            return res.status(200).json({ shippingCountries });
        } catch (error) {
            this.logger.error('Error getting shipping countries: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getShippingCitiesByCountryId(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const countryId: number = Number(req.params.countryId);

        try {
            const shippingCities =
                await this.shippingService.getShippingCitiesByCountryId(
                    countryId
                );
            return res.status(200).json({ shippingCities });
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                this.logger.error('Error getting shipping cities: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting shipping cities: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async calculateShippingCost(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const { country, ['shipping-method']: shippingMethod } = req.query;

        try {
            const shippingCost =
                await this.shippingService.calculateShippingCost(
                    country as string,
                    shippingMethod as string,
                    userId
                );
            return res.status(200).json({ shippingCost });
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                this.logger.error('Error calculating shipping cost: ' + error);
                return res.status(404).json({ message: error.message });
            }

            if (error instanceof ShippingLocationNotFoundError) {
                this.logger.error('Error calculating shipping cost: ' + error);
                return res.status(404).json({ message: error.message });
            }

            if (error instanceof ShippingOptionNotFoundError) {
                this.logger.error('Error calculating shipping cost: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error calculating shipping cost: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async determineWeightRangeForCart(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;

        try {
            const weight =
                await this.shippingService.determineWeightRangeForCart(userId);
            return res.status(200).json({ weight });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error determining weight range: ' + error);
                return res.status(404).json({ message: error.message });
            }
            if (error instanceof EmptyCartError) {
                this.logger.error('Error determining weight range: ' + error);
                return res.status(400).json({ message: error.message });
            }

            this.logger.error('Error determining weight range: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateShippingCountry(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const countryId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;
        const { name, rate } = req.body;

        try {
            const updatedCountry =
                await this.shippingService.updateShippingCountry(
                    countryId,
                    name,
                    rate
                );

            res.status(200).json({
                message: 'Shipping country updated successfully',
                updatedCountry,
            });

            await this.adminLogsService!.log(
                username,
                'shipping country',
                'update'
            );
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                this.logger.error('Error updating country: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error updating country: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateShippingCity(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const cityId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;
        const { name, postalCode } = req.body;

        try {
            const updatedCity = await this.shippingService.updateShippingCity(
                cityId,
                name,
                postalCode
            );

            res.status(200).json({
                message: 'Shipping city updated successfully',
                updatedCity,
            });

            await this.adminLogsService!.log(
                username,
                'shipping city',
                'update'
            );
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                this.logger.error('Error updating city: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error updating city: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async changeShippingMethodRate(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;
        const { method, rate } = req.body;

        try {
            const updatedRate =
                await this.shippingService.changeShippingMethodRate(
                    method,
                    rate
                );

            res.status(200).json({
                message: 'Shipping method rate updated successfully',
                updatedRate,
            });

            await this.adminLogsService!.log(
                username,
                'shipping method',
                'update'
            );
        } catch (error) {
            if (error instanceof ShippingOptionNotFoundError) {
                this.logger.error(
                    'Error changing shipping method rate: ' + error
                );
                return res.status(404).json({ message: error.message });
            }
            this.logger.error('Error changing shipping method rate: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async changeShippingWeightRate(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;
        const { weight, rate } = req.body;

        try {
            const updatedRate =
                await this.shippingService.changeShippingWeightRate(
                    weight,
                    rate
                );

            res.status(200).json({
                message: 'Shipping weight rate updated successfully',
                updatedRate,
            });

            await this.adminLogsService!.log(
                username,
                'shipping weight',
                'update'
            );
        } catch (error) {
            if (error instanceof ShippingOptionNotFoundError) {
                this.logger.error(
                    'Error changing shipping weight rate: ' + error
                );
                return res.status(404).json({ message: error.message });
            }
            this.logger.error('Error changing shipping weight rate: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteShippingCountry(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const countryId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;

        try {
            await this.shippingService.deleteShippingCountry(countryId);

            res.sendStatus(204);

            await this.adminLogsService!.log(
                username,
                'shipping country',
                'delete'
            );
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                this.logger.error('Error deleting country: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error deleting country: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteShippingCity(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const cityId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;

        try {
            await this.shippingService.deleteShippingCity(cityId);

            res.sendStatus(204);

            await this.adminLogsService!.log(
                username,
                'shipping city',
                'delete'
            );
        } catch (error) {
            if (error instanceof ShippingLocationNotFoundError) {
                this.logger.error('Error deleting city: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error deleting city: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
