import { Request, Response } from 'express';
import { AnalyticsService, LoggingService } from '@/services';
import { Logger } from '@/logger';
import { CategoryNotFoundError, UserNotFoundError } from '@/errors';
import { JwtPayload } from 'jsonwebtoken';
import { BaseInterval } from '@/types';
import { ReportNotFoundError } from '@/errors';

export class AnalyticsController {
    private analyticsService: AnalyticsService;
    private loggingService: LoggingService;
    private logger: Logger;

    constructor(
        analyticsService: AnalyticsService,
        loggingService: LoggingService
    ) {
        this.analyticsService = analyticsService;
        this.loggingService = loggingService;
        this.logger = new Logger();
    }

    public async generateReport(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;
        const { type, status, customerId, interval } = req.query;

        try {
            switch (type) {
                case 'sales':
                    await this.analyticsService.generateSalesReport(username);
                    break;
                case 'stock':
                    await this.analyticsService.generateStockReport(username);
                    break;
                case 'purchases':
                    await this.analyticsService.generatePurchasesReport(
                        username,
                        interval as BaseInterval
                    );
                    break;
                case 'orders':
                    if (!status)
                        return res
                            .status(400)
                            .json({ message: 'Missing status' });
                    await this.analyticsService.generateOrdersReport(
                        username,
                        status as string,
                        interval as BaseInterval
                    );
                    break;
                case 'customer-purchases':
                    if (!customerId)
                        return res
                            .status(400)
                            .json({ message: 'Customer Id is missing' });
                    await this.analyticsService.generateCustomerPurchasesReport(
                        username,
                        Number(customerId),
                        interval as BaseInterval
                    );
                    break;
                case 'customer-orders':
                    if (!customerId)
                        return res
                            .status(400)
                            .json({ message: 'Customer Id is missing' });
                    await this.analyticsService.generateCustomerOrdersReport(
                        username,
                        Number(customerId),
                        status as string,
                        interval as BaseInterval
                    );
                    break;
            }

            res.status(201).json({
                message:
                    (type as string).charAt(0).toUpperCase() +
                    (type as string).slice(1) +
                    ' Report generated successfully',
            });

            await this.loggingService.logOperation(
                username,
                type + ' report',
                'create'
            );
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error(`Error generating ${type} report: ` + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error(`Error generating ${type} report: ` + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalProductPurchases(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const {
            page,
            ['page-size']: pageSize,
            ['sort-by']: sortBy,
            ['sort-order']: sortOrder,
            ['min-purchases']: minPurchases,
            ['min-revenue']: minRevenue,
        } = req.query;

        try {
            const productPurchasesData =
                await this.analyticsService.getTotalProductPurchases(
                    parseInt(page as string),
                    parseInt(pageSize as string),
                    'full',
                    sortBy as string,
                    sortOrder as string,
                    parseInt(minPurchases as string),
                    parseFloat(minRevenue as string)
                );
            return res.status(200).json({ ...productPurchasesData });
        } catch (error) {
            this.logger.error(
                'Error getting total product purchases: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalProductsRevenue(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const total = await this.analyticsService.getTotalProductsRevenue();
            return res.status(200).json({ total });
        } catch (error) {
            this.logger.error('Error getting total product revenue: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalRevenue(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const total = await this.analyticsService.getTotalRevenue();
            return res.status(200).json({ total });
        } catch (error) {
            this.logger.error('Error getting total revenue: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAverageOrderValue(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const value = await this.analyticsService.getAverageOrderValue();
            return res.status(200).json({ value });
        } catch (error) {
            this.logger.error('Error getting average order value: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCategoryWithMostPurchases(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const data =
                await this.analyticsService.getCategoryWithMostPurchases();
            return res.status(200).json({ ...data });
        } catch (error) {
            this.logger.error(
                'Error getting category with most purchases: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTopCustomers(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const {
            ['get-by']: getBy,
            ['sort-by']: sortBy,
            page,
            ['page-size']: pageSize,
        } = req.query;

        try {
            const data = await this.analyticsService.getTopCustomers(
                getBy as 'order' | 'purchase',
                sortBy as
                    | 'totalRevenue'
                    | 'purchaseCount'
                    | 'orderCount'
                    | 'totalSpent',
                parseInt(page as string),
                parseInt(pageSize as string)
            );
            return res.status(200).json({ ...data });
        } catch (error) {
            this.logger.error('Error getting top customers: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalOrdersForCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId = Number(req.params.id);

        try {
            const data =
                await this.analyticsService.getTotalOrdersByCustomer(
                    customerId
                );
            return res.status(200).json({ ...data });
        } catch (error) {
            this.logger.error(
                'Error getting total orders for customer: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalProductPurchasesForCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId = Number(req.params.id);

        try {
            const data =
                await this.analyticsService.getTotalProductPurchasesForCustomer(
                    customerId
                );
            return res.status(200).json({ ...data });
        } catch (error) {
            this.logger.error(
                'Error getting total product purchases for customer: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCategoryWithMostPurchasesByCustomer(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const customerId = Number(req.params.id);

        try {
            const data =
                await this.analyticsService.getCategoryWithMostPurchasesByCustomer(
                    customerId
                );
            return res.status(200).json({ ...data });
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                this.logger.error(
                    'Error getting category with most purchases by customer: ' +
                        error
                );
                return res.status(404).json({ message: error.message });
            }

            this.logger.error(
                'Error getting category with most purchases by customer: ' +
                    error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    //    public async getTopSellingProducts(
    //        req: Request,
    //        res: Response
    //    ): Promise<void | Response> {
    //        const limit: number = Number(req.query.limit);
    //
    //        try {
    //            const products =
    //                await this.analyticsService.getTopSellingProducts(limit);
    //            return res.status(200).json({ products });
    //        } catch (error) {
    //            this.logger.error('Error getting top selling products: ' + error);
    //            return res.status(500).json({ message: 'Server error' });
    //        }
    //    }
    //
    //    public async getProductViews(
    //        req: Request,
    //        res: Response
    //    ): Promise<void | Response> {
    //        const productId: number = Number(req.params.id);
    //
    //        try {
    //            const productViews =
    //                await this.analyticsService.getProductViews(productId);
    //            return res.status(200).json({ productViews });
    //        } catch (error) {
    //            if (error instanceof ProductNotFoundError) {
    //                this.logger.error('Error getting product views: ' + error);
    //                return res.status(404).json({ message: error.message });
    //            }
    //
    //            this.logger.error('Error getting product views: ' + error);
    //            return res.status(500).json({ message: 'Server error' });
    //        }
    //    }

    public async getPurchasesPerCategory(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const {
            page,
            ['page-size']: pageSize,
            ['sort-by']: sortBy,
            ['sort-order']: sortOrder,
            ['min-purchases']: minPurchases,
            ['min-revenue']: minRevenue,
        } = req.query;

        try {
            const categoryPurchasesData =
                await this.analyticsService.getPurchasesPerCategory(
                    parseInt(page as string),
                    parseInt(pageSize as string),
                    sortBy as string,
                    sortOrder as string,
                    parseInt(minPurchases as string),
                    parseFloat(minRevenue as string)
                );
            return res.status(200).json({ ...categoryPurchasesData });
        } catch (error) {
            this.logger.error('Error getting purchases per category: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getConversionRate(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { interval } = req.query;

        try {
            const conversionRate =
                await this.analyticsService.getConversionRate(
                    interval as BaseInterval
                );
            return res.status(200).json({ conversionRate });
        } catch (error) {
            this.logger.error('Error getting conversion rate: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerAcquisitionRate(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { leads, interval } = req.query;

        try {
            const acquisitionRate =
                await this.analyticsService.getCustomerAcquisitionRate(
                    parseInt(leads as string),
                    interval as Exclude<BaseInterval, 'full'>
                );
            return res.status(200).json({ acquisitionRate });
        } catch (error) {
            this.logger.error(
                'Error getting customer acquisition rate: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCustomerAcquisitionCost(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { expenses, interval } = req.query;

        try {
            const acquisitionCost =
                await this.analyticsService.getCustomerAcquisitionCost(
                    parseFloat(expenses as string),
                    interval as Exclude<BaseInterval, 'full'>
                );
            return res.status(200).json({ acquisitionCost });
        } catch (error) {
            this.logger.error(
                'Error getting customer acquisition cost: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getRepeatPurchaseRate(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const repeatPurchaseRate =
                await this.analyticsService.getRepeatPurchaseRate();
            return res.status(200).json({ repeatPurchaseRate });
        } catch (error) {
            this.logger.error(
                'Error getting customer repeat purchase rate: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductAddToCartRate(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId = Number(req.params.id);

        try {
            const addToCartRate =
                await this.analyticsService.getProductAddToCartRate(productId);
            return res.status(200).json({ addToCartRate });
        } catch (error) {
            this.logger.error(
                'Error getting product add to cart rate: ' + error
            );
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCartAbandonmentRate(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const abandonmentRate =
                await this.analyticsService.getCartAbandonmentRate();
            return res.status(200).json({ abandonmentRate });
        } catch (error) {
            this.logger.error('Error getting cart abandonment rate: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPopulatedCarts(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const carts = await this.analyticsService.getPopulatedCarts();
            return res.status(200).json({ carts });
        } catch (error) {
            this.logger.error('Error getting populated carts: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteReport(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;
        const { name, type } = req.query;

        try {
            if (name && !type) {
                await this.analyticsService.deleteReport(name as string);
                res.sendStatus(204);
            } else if (type && !name) {
                await this.analyticsService.deleteAllReportsByType(
                    type as string
                );
                res.sendStatus(204);
            } else {
                return res
                    .sendStatus(400)
                    .json({ message: 'Missing name or type' });
            }

            await this.loggingService.logOperation(
                username,
                'report',
                'delete'
            );
        } catch (error) {
            if (error instanceof ReportNotFoundError) {
                this.logger.error('Error getting report by name: ' + error);
                return res.status(404).json({ message: error.message });
            }
            this.logger.error('Error deleting report by name: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
