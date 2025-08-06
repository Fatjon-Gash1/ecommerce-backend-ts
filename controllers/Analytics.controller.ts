import { Request, Response } from 'express';
import { AnalyticsService, LoggingService } from '@/services';
import { Logger } from '@/logger';
import { CategoryNotFoundError, UserNotFoundError } from '@/errors';
import { JwtPayload } from 'jsonwebtoken';
//import {
//    CategoryNotFoundError,
//    ProductNotFoundError,
//    InvalidStockStatusError,
//    ReportNotFoundError,
//    UserNotFoundError,
//    AdminLogInvalidTargetError,
//} from '@/errors';
//import { JwtPayload } from 'jsonwebtoken';

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

    public async generateSalesReport(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;

        try {
            await this.analyticsService.generateSalesReport(username);
            res.status(201).json({
                message: 'Sales report generated successfully',
            });

            await this.loggingService.logOperation(
                username,
                'sales report',
                'create'
            );
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                this.logger.error('Error generating sales report: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error generating sales report: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    //    public async generateStockReport(
    //        req: Request,
    //        res: Response
    //    ): Promise<void | Response> {
    //        const { username } = req.user as JwtPayload;
    //
    //        try {
    //            await this.analyticsService.generateStockReport(username);
    //            res.status(201).json({
    //                message: 'Stock report generated successfully',
    //            });
    //
    //            await this.loggingService.logOperation(
    //                username,
    //                'stock report',
    //                'create'
    //            );
    //        } catch (error) {
    //            this.logger.error('Error generating stock report: ' + error);
    //            return res.status(500).json({ message: 'Server error' });
    //        }
    //    }

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

    //    public async deleteReport(
    //        req: Request,
    //        res: Response
    //    ): Promise<void | Response> {
    //        const { username } = req.user as JwtPayload;
    //        const name: string = String(req.query.name);
    //
    //        try {
    //            await this.analyticsService.deleteReport(name);
    //            res.sendStatus(204);
    //
    //            await this.loggingService.logOperation(
    //                username,
    //                'report',
    //                'delete'
    //            );
    //        } catch (error) {
    //            if (error instanceof ReportNotFoundError) {
    //                this.logger.error('Error getting report by name: ' + error);
    //                return res.status(404).json({ message: error.message });
    //            }
    //            this.logger.error('Error deleting report by name: ' + error);
    //            return res.status(500).json({ message: 'Server error' });
    //        }
    //    }
    //
    //    public async deleteAllReportsByType(
    //        req: Request,
    //        res: Response
    //    ): Promise<void | Response> {
    //        const { username } = req.user as JwtPayload;
    //        const type: string = String(req.query.type);
    //
    //        try {
    //            await this.analyticsService.deleteAllReportsByType(type);
    //            res.sendStatus(204);
    //
    //            await this.loggingService.logOperation(
    //                username,
    //                'report',
    //                'delete'
    //            );
    //        } catch (error) {
    //            if (error instanceof ReportNotFoundError) {
    //                this.logger.error('Error getting report by name: ' + error);
    //                return res.status(404).json({ message: error.message });
    //            }
    //            this.logger.error('Error deleting report by name: ' + error);
    //            return res.status(500).json({ message: 'Server error' });
    //        }
    //    }
}
