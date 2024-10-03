import { Request, Response } from 'express';
import { AnalyticsService } from '../services';
import {
    CategoryNotFoundError,
    ProductNotFoundError,
    InvalidStockStatusError,
} from '../errors';

export class AnalyticsController {
    analyticsService: AnalyticsService;

    constructor(analyticsService: AnalyticsService) {
        this.analyticsService = analyticsService;
    }

    public async getTotalProductPurchases(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { totalCount, products } =
                await this.analyticsService.getTotalProductPurchases();
            res.status(200).json({ totalProducts: totalCount, products });
        } catch (error) {
            console.error('Error getting total product purchases: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalProductRevenue(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const totalProductRevenue =
                await this.analyticsService.getTotalProductRevenue();
            res.status(200).json({ totalProductRevenue });
        } catch (error) {
            console.error('Error getting total product revenue: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalRevenue(_req: Request, res: Response): Promise<void> {
        try {
            const totalRevenue = await this.analyticsService.getTotalRevenue();
            res.status(200).json({ totalRevenue });
        } catch (error) {
            console.error('Error getting total revenue: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAverageOrderValue(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const averageOrderValue =
                await this.analyticsService.getAverageOrderValue();
            res.status(200).json({ averageOrderValue });
        } catch (error) {
            console.error('Error getting average order value: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCategoryWithMostPurchases(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { categoryName, purchaseCount } =
                await this.analyticsService.getCategoryWithMostPurchases();
            res.status(200).json({ categoryName, purchaseCount });
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error(
                    'Error getting category with most purchases: ',
                    error
                );
                res.status(404).json({ message: error.message });
                return;
            }

            console.error(
                'Error getting category with most purchases: ',
                error
            );
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTotalProductPurchasesForCustomer(
        req: Request,
        res: Response
    ): Promise<void> {
        const customerId: number = Number(req.params.id);

        try {
            const { totalCount, products } =
                await this.analyticsService.getTotalProductPurchasesForCustomer(
                    customerId
                );
            res.status(200).json({ totalCount, products });
        } catch (error) {
            console.error(
                'Error getting total product purchases for customer: ',
                error
            );
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCategoryWithMostPurchasesByCustomer(
        req: Request,
        res: Response
    ): Promise<void> {
        const customerId: number = Number(req.params.id);

        try {
            const { categoryName, purchaseCount } =
                await this.analyticsService.getCategoryWithMostPurchasesByCustomer(
                    customerId
                );
            res.status(200).json({ categoryName, purchaseCount });
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error(
                    'Error getting category with most purchases by customer: ',
                    error
                );
                res.status(404).json({ message: error.message });
                return;
            }

            console.error(
                'Error getting category with most purchases by customer: ',
                error
            );
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getTopSellingProducts(
        req: Request,
        res: Response
    ): Promise<void> {
        const limit: number = Number(req.query.limit);

        try {
            const products =
                await this.analyticsService.getTopSellingProducts(limit);
            res.status(200).json({ products });
        } catch (error) {
            console.error('Error getting top selling products: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductViews(req: Request, res: Response): Promise<void> {
        const productId: number = Number(req.params.id);

        try {
            const productViews =
                await this.analyticsService.getProductViews(productId);
            res.status(200).json({ productViews });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error getting product views: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting product views: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCategoryPurchases(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const categories =
                await this.analyticsService.getCategoryPurchases();
            res.status(200).json({ categories });
        } catch (error) {
            console.error('Error getting category purchases: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductsByStockStatus(
        req: Request,
        res: Response
    ): Promise<void> {
        const status: string = req.params.status;

        try {
            const { total, rows } =
                await this.analyticsService.getProductsByStockStatus(status);
            res.status(200).json({ totalProducts: total, products: rows });
        } catch (error) {
            console.error('Error getting products by stock status: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getStockDataForCategoryByStatus(
        req: Request,
        res: Response
    ): Promise<void> {
        const status: string = req.params.status;

        try {
            const stockData =
                await this.analyticsService.getStockDataForCategoryByStatus(
                    status
                );
            res.status(200).json({ stockData });
        } catch (error) {
            if (error instanceof InvalidStockStatusError) {
                console.error(
                    'Error getting stock data for category by status: ',
                    error
                );
                res.status(400).json({ message: error.message });
                return;
            }

            console.error(
                'Error getting stock data for category by status: ',
                error
            );
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getPlatformOrdersByStatus(
        req: Request,
        res: Response
    ): Promise<void> {
        const status: string = req.params.status;

        try {
            const { total, rows } =
                await this.analyticsService.getPlatformOrdersByStatus(status);
            res.status(200).json({ totalOrders: total, orders: rows });
        } catch (error) {
            console.error('Error getting platform orders by status: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async generateSalesReport(
        req: Request,
        res: Response
    ): Promise<void> {
        const { user } = req.body;

        try {
            await this.analyticsService.generateSalesReport(user);
            res.status(201).json({
                message: 'Sales report generated successfully',
            });
        } catch (error) {
            console.error('Error generating sales report: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async generateStockReport(
        req: Request,
        res: Response
    ): Promise<void> {
        const { user } = req.body;

        try {
            await this.analyticsService.generateStockReport(user);
            res.status(201).json({
                message: 'Stock report generated successfully',
            });
        } catch (error) {
            console.error('Error generating stock report: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
