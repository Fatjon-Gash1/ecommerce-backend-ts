import { ProductNotFoundError } from '../errors';
import { Purchase, Product, Category, Sale, Order } from '../models/relational';
import { Sequelize, Op } from 'sequelize';
import PDFDocument from 'pdfkit';
import fs from 'fs';

interface ProductPurchases {
    productId: number;
    productName: string;
    productPrice: number;
    purchaseCount: number;
    totalRevenue: number;
}

interface TopCategory {
    categoryId?: number;
    categoryName: string;
    purchaseCount: number;
    totalRevenue?: number;
}

/**
 * Service responsible for analytics-related operations and report generation.
 */

export class AnalyticsService {
    /**
     * Retrieves the total product purchases in the platform.
     *
     * @returns A promise that resolves to an object containing
     * the count and an array of products
     */
    public async getTotalProductPurchases(): Promise<{
        totalCount: number;
        products: ProductPurchases[];
    }> {
        const totalCount = await Purchase.count();
        const results = await Purchase.findAll({
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price'],
                },
            ],
            attributes: [
                [Sequelize.col('Product.id'), 'productId'],
                [Sequelize.col('Product.name'), 'productName'],
                [Sequelize.col('Product.price'), 'productPrice'],
                [
                    Sequelize.fn('COUNT', Sequelize.col('Product.id')),
                    'purchaseCount',
                ],
                [
                    Sequelize.fn('SUM', Sequelize.col('Product.price')),
                    'totalRevenue',
                ],
            ],
            group: ['Product.id', 'Product.name', 'Product.price'],
            order: [
                [Sequelize.fn('COUNT', Sequelize.col('Product.id')), 'DESC'],
            ],
        });

        return {
            totalCount,
            products: results as unknown as ProductPurchases[],
        };
    }

    /** Retrieves the total revenue of product sales.
     *
     * @returns A promise that resolves to a number of total product sales.
     */
    public async getTotalProductRevenue(): Promise<number> {
        const result = await Purchase.findOne({
            include: {
                model: Product,
                attributes: [],
            },
            attributes: [
                [
                    Sequelize.fn('SUM', Sequelize.col('Product.price')),
                    'totalRevenue',
                ],
            ],
            raw: true,
        });

        if (!result) {
            return 0;
        }

        return Number(result.totalRevenue);
    }

    /**
     * Retrieves the total revenue of the platform including shipping costs.
     *
     * @returns A promise that resolves to a number representing
     * the total revenue
     */
    public async getTotalRevenue(): Promise<number> {
        const result = await Sale.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('total')), 'totalRevenue'],
            ],
            raw: true,
        });

        if (!result) {
            return 0;
        }

        return Number(result.totalRevenue);
    }

    /**
     * Retrieves the average order value in the platform.
     *
     * @returns A promise that resolves to a number representing
     * the average order value
     */
    public async getAverageOrderValue(): Promise<number> {
        const result = await Sale.findOne({
            attributes: [
                [
                    Sequelize.fn('AVG', Sequelize.col('total')),
                    'averageOrderValue',
                ],
            ],
            raw: true,
        });

        if (!result) {
            return 0;
        }

        return Number(result.averageOrderValue);
    }

    /**
     * Retrieves the category with the most purchases.
     *
     * @returns A promise that resolves to an object containing the category
     * and the count of purchases.
     */
    public async getCategoryWithMostPurchases(): Promise<TopCategory | null> {
        const results = await Purchase.findAll({
            include: [
                {
                    model: Product,
                    include: [
                        {
                            model: Category,
                            attributes: ['id', 'name'],
                        },
                    ],
                },
            ],
            attributes: [
                [Sequelize.col('Product.Category.id'), 'categoryId'],
                [Sequelize.col('Product.Category.name'), 'categoryName'],
                [
                    Sequelize.fn('COUNT', Sequelize.col('Product.Category.id')),
                    'purchaseCount',
                ],
            ],
            group: ['Product.Category.id', 'Product.Category.name'],
            order: [
                [
                    Sequelize.fn('COUNT', Sequelize.col('Product.Category.id')),
                    'DESC',
                ],
            ],
            limit: 1,
        });

        const result = results[0] as unknown as TopCategory | undefined;

        if (result) {
            const { categoryName, purchaseCount } = result;
            return { categoryName, purchaseCount };
        }

        return null;
    }

    /**
     * Retrieves the total product purchases for customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise that resolves to an object containing
     * the count and an array of products
     */
    public async getTotalProductPurchasesForCustomer(
        customerId: number
    ): Promise<{
        totalCount: number;
        products: ProductPurchases[];
    }> {
        const totalCount = await Purchase.count({ where: { customerId } });
        const results = await Purchase.findAll({
            where: { customerId },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price'],
                },
            ],
            attributes: [
                [Sequelize.col('Product.id'), 'productId'],
                [Sequelize.col('Product.name'), 'productName'],
                [Sequelize.col('Product.price'), 'productPrice'],
                [
                    Sequelize.fn('COUNT', Sequelize.col('Product.id')),
                    'purchaseCount',
                ],
            ],
            group: ['Product.id', 'Product.name', 'Product.price'],
            order: [
                [Sequelize.fn('COUNT', Sequelize.col('Product.id')), 'DESC'],
            ],
        });

        return {
            totalCount,
            products: results as unknown as ProductPurchases[],
        };
    }

    /**
     * Retrieves the category with the most purchases made by customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise that resolves to an object containing the category
     * and the count of purchases
     */
    public async getCategoryWithMostPurchasesByCustomer(
        customerId: number
    ): Promise<TopCategory | null> {
        const results = await Purchase.findAll({
            where: { customerId },
            include: [
                {
                    model: Product,
                    include: [
                        {
                            model: Category,
                            attributes: ['id', 'name'],
                        },
                    ],
                },
            ],
            attributes: [
                [Sequelize.col('Product.Category.id'), 'categoryId'],
                [Sequelize.col('Product.Category.name'), 'categoryName'],
                [
                    Sequelize.fn('COUNT', Sequelize.col('Product.Category.id')),
                    'purchaseCount',
                ],
            ],
            group: ['Product.Category.id', 'Product.Category.name'],
            order: [
                [
                    Sequelize.fn('COUNT', Sequelize.col('Product.Category.id')),
                    'DESC',
                ],
            ],
            limit: 1,
        });

        const result = results[0] as unknown as TopCategory | undefined;

        if (result) {
            const { categoryName, purchaseCount } = result;
            return { categoryName, purchaseCount };
        }

        return null;
    }

    /**
     * Retrieves the top selling products.
     *
     * @param limit - The number of products to retrieve
     * @returns A promise resolving to an array of Product instances
     */
    public async getTopSellingProducts(
        limit: number
    ): Promise<ProductPurchases[]> {
        const products = await Product.findAll({
            include: [
                {
                    model: Purchase,
                    attributes: [],
                },
            ],
            attributes: [
                'name',
                'price',
                [
                    Sequelize.fn('COUNT', Sequelize.col('Purchases.productId')),
                    'purchaseCount',
                ],
            ],
            group: ['Product.id'],
            order: [
                [
                    Sequelize.fn('COUNT', Sequelize.col('Purchases.productId')),
                    'DESC',
                ],
            ],
            limit,
        });

        return products
            .map((product) => ({
                productName: product.name,
                productPrice: product.price,
                purchaseCount: product.getDataValue('purchaseCount'),
            }))
            .filter(
                (product): product is ProductPurchases => product !== undefined
            );
    }

    /**
     * Retrieves the total views of a product.
     *
     * @param productId - The ID of the product
     * @returns A promise resolving to a number representing
     * the total views of the product
     */
    public async getProductViews(productId: number): Promise<number> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        return product.views!;
    }

    /**
     * Retrieves the total purchases for each category.
     *
     * @returns A promise resolving to an array of objects containing
     * the category Id, name and the total purchases
     */
    public async getCategoryPurchases(): Promise<TopCategory[]> {
        const results = await Purchase.findAll({
            include: [
                {
                    model: Product,
                    include: [
                        {
                            model: Category,
                            attributes: ['id', 'name'],
                        },
                    ],
                },
            ],
            attributes: [
                [Sequelize.col('Product.Category.id'), 'categoryId'],
                [Sequelize.col('Product.Category.name'), 'categoryName'],
                [
                    Sequelize.fn('COUNT', Sequelize.col('Product.Category.id')),
                    'purchaseCount',
                ],
                [
                    Sequelize.fn('SUM', Sequelize.col('Product.price')),
                    'totalRevenue',
                ],
            ],
            group: ['Product.Category.id', 'Product.Category.name'],
            order: [
                [
                    Sequelize.fn('COUNT', Sequelize.col('Product.Category.id')),
                    'DESC',
                ],
            ],
        });

        return results.map((purchase) => ({
            categoryId: purchase.getDataValue('categoryId')!,
            categoryName: purchase.getDataValue('categoryName')!,
            purchaseCount: purchase.getDataValue('purchaseCount')!,
            totalRevenue: purchase.getDataValue('totalRevenue')!,
        }));
    }

    /**
     * Retrieves the products based on stock status.
     *
     * @param status - The stock status of the products (e.g., 'instock', 'outofstock', 'lowstock')
     * @returns A promise resolving to an object containing
     * the products in stock for the given status
     */
    public async getProductsByStockStatus(
        status: string = 'instock'
    ): Promise<{ total: number; rows: Product[] }> {
        let operator;

        status = status.toLowerCase();

        switch (status) {
            case 'instock':
                operator = { [Op.gt]: 0 };
                break;
            case 'outofstock':
                operator = 0;
                break;
            case 'lowstock':
                operator = { [Op.lte]: 0 };
                break;
            default:
                throw new Error('Invalid status');
        }

        const { count, rows } = await Product.findAndCountAll({
            where: { stockQuantity: operator },
        });

        return { total: count, rows };
    }

    /**
     * Retrieves stock data for each category.
     *
     * @param status - The stock status of the products (e.g., 'instock', 'outofstock', 'lowstock')
     * @returns A promise resolving to an array of objects containing the category name and stock status
     */
    public async getStockDataByCategory(
        status: string = 'instock'
    ): Promise<{ categoryName: string; total: number }[]> {
        let operator;

        status = status.toLowerCase();

        switch (status) {
            case 'instock':
                operator = { [Op.gt]: 0 };
                break;
            case 'outofstock':
                operator = 0;
                break;
            case 'lowstock':
                operator = { [Op.lte]: 0 };
                break;
            default:
                throw new Error('Invalid status');
        }

        const stockData = await Product.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('Product.id')), 'total'],
                'categoryId',
            ],
            where: {
                stockQuantity: operator,
            },
            group: ['categoryId'],
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name'],
                },
            ],
        });

        return stockData.map((item) => ({
            categoryName: item.Category!.name,
            total: item.getDataValue('total')!,
        }));
    }

    /**
     * Retrieves the total platform orders by status.
     *
     * @param status - The status of the order (e.g., 'Pending', 'Cancelled', 'Delivered')
     * @returns A promise that resolves to an object containing
     * the count and an array of orders
     */
    public async getPlatformOrdersByStatus(
        status: string
    ): Promise<{ total: number; rows: Order[] }> {
        const { count, rows } = await Order.findAndCountAll({
            where: { status },
        });

        return { total: count, rows };
    }

    /**
     * Generates a broad sales report including product sales, category sales, and total revenue.
     *
     * @param user - The user's first and last name
     * @returns A promise that resolves to void
     */
    public async generateSalesReport(user: {
        firstName: string;
        lastName: string;
    }): Promise<void> {
        const firstName =
            user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
        const lastName =
            user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1);

        const productRevenue = await this.getTotalProductRevenue();
        const totalRevenue = await this.getTotalRevenue();
        const totalTransactions = await Sale.count();
        const averageOrderValue = await this.getAverageOrderValue();
        const { totalCount } = await this.getTotalProductPurchases();
        const pendingOrders = await this.getPlatformOrdersByStatus('Pending');
        const cancelledOrders =
            await this.getPlatformOrdersByStatus('Cancelled');
        const deliveredOrders =
            await this.getPlatformOrdersByStatus('Delivered');
        const categoryData = await this.getCategoryPurchases();

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream('reports/sales_report.pdf'));

        doc.fontSize(25).text('Product Sales Report', { align: 'center' });
        doc.fontSize(18)
            .moveDown()
            .text('E-Commerce Site', { align: 'center' });

        doc.fillColor('black')
            .moveDown()
            .fontSize(16)
            .text('Sales Overview', 60);
        doc.fontSize(12).moveDown();
        doc.text('Total Sales: ' + productRevenue, 65, 195, { continued: true })
            .fillColor('#4CAF50')
            .text(' (+15%)');
        doc.fillColor('black')
            .moveDown(0.25)
            .text('Total Sales including shipping: ' + totalRevenue, {
                continued: true,
            })
            .fillColor('#4CAF50')
            .text(' (+35%)');
        doc.fillColor('black')
            .moveDown(0.25)
            .text('Number of Products Sold: ' + totalCount, { continued: true })
            .fillColor('#4CAF50')
            .text(' (+8%)');
        doc.fillColor('black')
            .moveDown(0.25)
            .text('Number of Transactions: ' + totalTransactions, {
                continued: true,
            })
            .fillColor('#FF3300')
            .text(' (-5%)');
        doc.fillColor('black')
            .moveDown(0.25)
            .text('Average Order Value: ' + averageOrderValue, {
                continued: true,
            })
            .fillColor('#4CAF50')
            .text(' (+10%)');

        doc.circle(490, 210, 60)
            .lineWidth(0)
            .fillAndStroke('darkblue', '#ffffff');

        doc.rect(60, 300, 490, 30).fill('lightblue');
        doc.rect(60, 330, 490, 30).fill('lightgray');
        doc.strokeColor('gray').moveTo(61, 360).lineTo(61, 385).stroke();
        doc.moveTo(61, 385).lineTo(549, 385).stroke();
        doc.moveTo(549, 385).lineTo(549, 360).stroke();

        doc.moveDown(2.3)
            .fill('black')
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('Total Orders Data', 70);

        doc.moveDown()
            .fontSize(12)
            .text('Pending', 75, 340, { continued: true });
        doc.text('Cancelled', 235, 340, { continued: true });
        doc.text('Delivered', 377, 340);

        doc.font('Helvetica');

        doc.text(pendingOrders.total.toString(), -346, 368, {
            align: 'center',
            continued: true,
        });
        doc.text(cancelledOrders.total.toString(), -148, 368, {
            align: 'center',
            continued: true,
        });
        doc.text(deliveredOrders.total.toString(), 32, 368, {
            align: 'center',
        });

        doc.rect(60, 397, 490, 30).fill('lightblue');
        doc.fillColor('black')
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Product Sales By Category Overview', 70, 407);
        doc.font('Helvetica').fontSize(12);
        let yPosition = 427;

        categoryData.forEach((category, index) => {
            const bgColor = index % 2 === 0 ? '#F2F2F2' : '#FFFFFF';
            doc.rect(60, yPosition, 490, 30).fill(bgColor).stroke();
            doc.fillColor('black').text(
                `${index + 1}. ${category.categoryName} - ${category.purchaseCount} items - $${category.totalRevenue}`,
                68,
                yPosition + 10
            );

            /* Color sales percentage changes
            const changeColor = category.change > 0 ? '#4CAF50' : '#FF3300';
            doc.fillColor(changeColor).text(
                `(${category.change}%)`,
                500,
                yPosition + 10,
                { align: 'right' }
            );
            */

            yPosition += 30;
        });

        doc.fillColor('black')
            .fontSize(12)
            .moveDown()
            .text(`Report generated by: ${firstName} ${lastName}`, 68, 690, {
                continued: true,
            });
        doc.fillColor('gray').text(new Date().toLocaleDateString(), {
            align: 'right',
        });
        doc.fillColor('black')
            .moveDown(0.25)
            .fontSize(10)
            .text('Administrator');

        doc.end();
    }

    /**
     * Generates a stock report based on stock quantity.
     *
     * @param user - The user's first and last name
     * @returns A promise that resolves to void
     */
    public async generateStockReport(user: {
        firstName: string;
        lastName: string;
    }) {
        const firstName =
            user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
        const lastName =
            user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1);

        const inStockItems = await this.getProductsByStockStatus('instock');
        const outOfStockItems =
            await this.getProductsByStockStatus('outofstock');
        const lowInStockitems = await this.getProductsByStockStatus('lowstock');

        const categoriesInStock = await this.getStockDataByCategory('instock');
        const categoriesOutOfStock =
            await this.getStockDataByCategory('outofstock');
        const categoriesLowInStock =
            await this.getStockDataByCategory('lowstock');

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream('reports/stock_report.pdf'));

        doc.fontSize(25).text('Products Sales Report', { align: 'center' });
        doc.fontSize(18)
            .moveDown()
            .text('E-Commerce Site', { align: 'center' });
        doc.rect(60, 170, 490, 30).fill('#CCCCCC');
        doc.font('Helvetica-Bold')
            .fillColor('black')
            .fontSize(12)
            .text('Stock level', 68, 180);
        doc.rect(60, 200, 490, 30).fill('lightblue');
        doc.fillColor('black')
            .fontSize(12)
            .text('Nr', 68, 210, { continued: true });
        doc.text('Category', 78, 210, { continued: true });
        doc.text('In Stock', 260, 210, { continued: true });
        doc.text('Low in Stock', 270, 210, { continued: true });
        doc.text('Out of Stock', 280);

        let yPosition = 230;
        doc.font('Helvetica');

        categoriesInStock.forEach((category, index) => {
            const bgColor = index % 2 == 0 ? '#F2F2F2' : '#FFFFFF';
            doc.rect(60, yPosition, 490, 30).fill(bgColor).stroke();
            doc.fillColor('black').text(
                `${index + 1}.    ${category.categoryName}`,
                68,
                yPosition + 10
            );
            doc.text(category.total.toString(), 330, yPosition + 10);
            yPosition += 30;
        });

        categoriesLowInStock.forEach((category) => {
            yPosition = 230;
            doc.text(category.total.toString(), 390, yPosition + 10);
        });

        categoriesOutOfStock.forEach((category) => {
            yPosition = 230;
            doc.text(category.total.toString(), 470, yPosition + 10);
        });

        doc.fontSize(12).moveDown(2);
        doc.text('In stock items: ' + inStockItems.total, 68);
        doc.moveDown(0.25).text('Out of stock items: ' + outOfStockItems.total);
        doc.moveDown(0.25).text('Low in stock items: ' + lowInStockitems.total);

        doc.text(`Report generated by: ${firstName} ${lastName}`, 60, 700, {
            continued: true,
        });
        doc.text('Generation date: ' + new Date().toLocaleDateString(), 235);

        doc.end();
    }
}
