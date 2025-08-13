import PDFDocument from 'pdfkit-table';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import fs from 'fs';
import path from 'path';
import sequelize from 'sequelize';
import {
    Purchase,
    Product,
    Category,
    Order,
    Customer,
    User,
    Admin,
} from '@/models/relational';
import {
    CategoryNotFoundError,
    ReportNotFoundError,
    UserNotFoundError,
} from '@/errors';
import {
    OrderResponse,
    PageMetaData,
    PreparedTopCustomerObject,
    PurchasedCategoryResponse,
    PurchasedProductResponse,
    TopCustomerSortBy,
    TopCustomersResponse,
} from '@/types';

const reportsDir = path.join(process.env.BASE_PATH, '/reports');
const assetsDir = path.join(process.env.BASE_PATH, '/assets');

/**
 * Service responsible for analytics-related operations and report generation.
 */
export class AnalyticsService {
    /**
     * Generates a broad sales report including product sales, category sales, total revenue and so on.
     *
     * @param username - The user's username
     */
    public async generateSalesReport(username: string): Promise<void> {
        const admin = (
            await Admin.findOne({
                include: [{ model: User, as: 'user', where: { username } }],
            })
        )?.toJSON();

        if (!admin) {
            throw new UserNotFoundError('Admin not found');
        }

        const firstName =
            admin.user!.firstName.charAt(0).toUpperCase() +
            admin.user!.firstName.slice(1);
        const lastName =
            admin.user!.lastName.charAt(0).toUpperCase() +
            admin.user!.lastName.slice(1);

        const productRevenue = await this.getTotalProductsRevenue();
        const totalRevenue = await this.getTotalRevenue();
        const totalTransactions = await Order.count();
        const averageOrderValue = await this.getAverageOrderValue();
        const purchasesCount = await Purchase.count();
        const mostPurchasedCategory = await this.getCategoryWithMostPurchases();
        const categoriesWithPurchases = await this.getPurchasesPerCategory(
            1,
            50
        );
        const pendingOrders = await this.getOrdersByStatus('pending');
        const shippedOrders = await this.getOrdersByStatus('shipped');
        const awaitingPickupOrders =
            await this.getOrdersByStatus('awaiting-pickup');
        const deliveredOrders = await this.getOrdersByStatus('delivered');
        const refundedOrders = await this.getOrdersByStatus('refunded');
        const partiallyRefundedOrders =
            await this.getOrdersByStatus('partially-refunded');
        const uncollectedOrders = await this.getOrdersByStatus('uncollected');

        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        doc.pipe(
            fs.createWriteStream(`${reportsDir}/sales_report_${Date.now()}.pdf`)
        );

        doc.image(
            assetsDir + '/water.png',
            doc.page.width - doc.page.margins.left * 2,
            10,
            { scale: 0.1 }
        );

        doc.font('Helvetica').fontSize(14).text('company image').moveDown();
        doc.fontSize(18).text('Generic Sales Report', {
            align: 'left',
            continued: true,
        });
        doc.fontSize(14).text('Company Name Inc.', { align: 'right' });

        const availableWidth = doc.page.width - doc.page.margins.left * 2;

        doc.moveDown().rect(doc.x, doc.y, availableWidth, 25).fill('#3761a7');
        doc.font('Helvetica-Bold')
            .fillColor('white')
            .fontSize(12)
            .text('Sales Summary', doc.x + 10, doc.y + 10);
        doc.moveDown(0.25);
        const salesTable = {
            headers: ['Insight', 'Value'],
            rows: [
                ['Total Sales', productRevenue.toString()],
                ['Total Sales including shipping', totalRevenue.toString()],
                ['Number of Products Sold', purchasesCount.toString()],
                ['Number of Transactions', totalTransactions.toString()],
                ['Average Order Value', averageOrderValue.toString()],
            ],
        };
        doc.table(salesTable, {
            hideHeader: true,
            x: doc.x - 10,
        });

        doc.rect(doc.x, doc.y, availableWidth, 25).fill('#3761a7');
        doc.font('Helvetica-Bold')
            .fillColor('white')
            .fontSize(12)
            .text('Order Data', doc.x + 10, doc.y + 10);
        doc.moveDown();
        const ordersTable = {
            headers: ['Status', 'Total'],
            rows: [
                ['Pending', pendingOrders.count.toString()],
                ['Shipped', shippedOrders.count.toString()],
                ['Awaiting Pickup', awaitingPickupOrders.count.toString()],
                ['Delivered', deliveredOrders.count.toString()],
                ['Refunded', refundedOrders.count.toString()],
                [
                    'Partially Refunded',
                    partiallyRefundedOrders.count.toString(),
                ],
                ['Uncollected', uncollectedOrders.count.toString()],
            ],
        };

        doc.table(ordersTable, {
            hideHeader: true,
            x: doc.x - 10,
            y: doc.y - 10,
        });

        doc.moveDown();
        doc.fontSize(14).text(`Categories based on purchases: `);

        const categoriesTable = {
            headers: ['Category', 'Total Products', 'Total Purchases', 'Total Revenue'],
            rows: [
                //categoriesWithPurchases.categories.map((c: PurchasedCategoryResponse) => (
                //    [c.name, c.totalProducts, c.purchaseCount, c.totalRevenue]
                //));

            ],
        };

        doc.table(categoriesTable, {
            hideHeader: true,
            x:  doc.x / 2,
            y: doc.y - 10,
        });

        const width = 800;
        const height = 400;
        const chart = new ChartJSNodeCanvas({ width, height });

        const data = {
            labels: categoriesWithPurchases.categories.map((c) => c.name),
            datasets: [
                {
                    label: 'Category Purchases Dataset',
                    data: categoriesWithPurchases.categories.map(
                        (c) => c.purchaseCount
                    ),
                },
            ],
        };
        const config: ChartConfiguration<'doughnut'> = {
            type: 'doughnut',
            data,
        };
        const image = await chart.renderToBuffer(config);

        doc.image(image, { fit: [500, 300], align: 'right' });

        const bottomY = doc.page.height - doc.page.margins.bottom;
        doc.fillColor('black')
            .font('Helvetica')
            .fontSize(10)
            .text(
                `Report generated by: ${firstName} ${lastName}`,
                doc.x,
                bottomY - 40,
                {
                    continued: true,
                }
            );
        doc.fillColor('gray').text(
            `Generated on: ${new Date().toLocaleDateString()}`,
            {
                align: 'right',
            }
        );
        doc.fillColor('black').moveDown(0.25).fontSize(8).text('Administrator');

        doc.end();
    }

    /**
     * Generates a stock report based on stock quantity.
     *
     * @param username - The user's username
     * @returns A promise that resolves to void
     */
    /*   public async generateStockReport(username: string) {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            throw new UserNotFoundError();
        }

        const firstName =
            user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
        const lastName =
            user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1);

        const inStockItems = await this.getProductsByStockStatus('instock');
        const outOfStockItems =
            await this.getProductsByStockStatus('outofstock');
        const lowInStockitems = await this.getProductsByStockStatus('lowstock');

        const categoriesInStock =
            await this.getStockDataForCategoryByStatus('instock');
        const categoriesOutOfStock =
            await this.getStockDataForCategoryByStatus('outofstock');
        const categoriesLowInStock =
            await this.getStockDataForCategoryByStatus('lowstock');

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
    }*/

    /**
     * Retrieves all platform orders by a given status.
     *
     * @param status - The status of the order
     * @returns A promise resolving to an array of Order instances and their count
     */
    private async getOrdersByStatus(
        status: string
    ): Promise<{ count: number; orders: OrderResponse[] }> {
        const { count, rows } = await Order.findAndCountAll({
            where: { status },
        });

        const orders = rows.map((order) => order.toJSON());

        return { count, orders };
    }

    /**
     * Retrieves the total number of product purchases and each
     * purchased product in the platform.
     *
     * @param page - The current page number
     * @param pageSize - The number of items per page
     * @param [sortBy='purchaseCount'] - Sort by the specified column
     * @param [sortOrder='DESC'] - Sorting order
     * @param [minPurchases=0] - The minimum number of purchases for a product
     * @param [minRevenue=0.0] - The minimum revenue for a product
     * @returns A promise that resolves to an object containing
     * the total purchase count and an array of unique purchased products
     */
    public async getTotalProductPurchases(
        page: number,
        pageSize: number,
        sortBy: string = 'purchaseCount',
        sortOrder: string = 'DESC',
        minPurchases: number = 0,
        minRevenue: number = 0.0
    ): Promise<{
        purchasesCount: number;
        products: PurchasedProductResponse[];
        meta: PageMetaData;
    }> {
        const offset = (page - 1) * pageSize;
        const purchasesCount = await Purchase.count();
        const productPurchases = await Purchase.findAll({
            attributes: [
                'productId',
                [
                    sequelize.fn('COUNT', sequelize.col('Purchase.productId')),
                    'purchaseCount',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('Purchase.purchasePrice')
                    ),
                    'totalRevenue',
                ],
            ],
            include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
            group: ['Purchase.productId', 'Product.id'],
            having: sequelize.and(
                sequelize.literal(
                    `COUNT(Purchase.productId) >= ${minPurchases}`
                ),
                sequelize.literal(
                    `SUM(Purchase.purchasePrice) >= ${minRevenue}`
                )
            ),
            order: [[sequelize.literal(sortBy), sortOrder]],
            limit: pageSize,
            offset,
        });

        const totalProductGroups = (
            await Purchase.findAll({
                attributes: [
                    [
                        sequelize.fn(
                            'COUNT',
                            sequelize.col('Purchase.productId')
                        ),
                        'purchaseCount',
                    ],
                ],
                group: ['Purchase.productId'],
                having: sequelize.and(
                    sequelize.literal(
                        `COUNT(Purchase.productId) >= ${minPurchases}`
                    ),
                    sequelize.literal(
                        `SUM(Purchase.purchasePrice) >= ${minRevenue}`
                    )
                ),
            })
        ).length;

        return {
            purchasesCount,
            products:
                purchasesCount > 0
                    ? productPurchases.map((p) => {
                          const o = p.toJSON();
                          return {
                              id: o.productId,
                              name: o.Product!.name,
                              currentPrice: o.Product!.price,
                              purchaseCount: parseFloat(
                                  o.purchaseCount!.toFixed(2)
                              ),
                              totalRevenue: parseFloat(
                                  o.totalRevenue!.toFixed(2)
                              ),
                          };
                      })
                    : [],
            meta: {
                page,
                pageSize,
                total: totalProductGroups,
                totalPages: Math.ceil(totalProductGroups / pageSize),
            },
        };
    }

    /** Retrieves the total revenue of product sales.
     *
     * @returns A promise that resolves to a number representing the total revenue of product sales.
     */
    public async getTotalProductsRevenue(): Promise<number> {
        return parseFloat((await Purchase.sum('purchasePrice')).toFixed(2));
    }

    /**
     * Retrieves the total revenue of the platform including shipping costs.
     *
     * @returns A promise that resolves to a number representing
     * the total revenue
     */
    public async getTotalRevenue(): Promise<number> {
        return parseFloat((await Order.sum('total')).toFixed(2));
    }

    /**
     * Retrieves the average order value in the platform.
     *
     * @returns A promise that resolves to a number representing
     * the average order value
     */
    public async getAverageOrderValue(): Promise<number> {
        const result = await Order.findOne({
            attributes: [
                [
                    sequelize.fn('AVG', sequelize.col('total')),
                    'averageTotalValue',
                ],
            ],
            raw: true,
        });

        return parseFloat(result?.averageTotalValue ?? '0');
    }

    /**
     * Retrieves the category with the most purchases.
     *
     * @returns A promise that resolves to an object containing the category
     * and the count of purchases.
     */
    public async getCategoryWithMostPurchases(): Promise<PurchasedCategoryResponse> {
        const result = await Purchase.findOne({
            include: [
                {
                    model: Product,
                    include: [
                        {
                            model: Category,
                            attributes: [],
                        },
                    ],
                    attributes: [],
                },
            ],
            attributes: [
                [sequelize.col('Product.Category.id'), 'categoryId'],
                [sequelize.col('Product.Category.name'), 'categoryName'],
                [
                    sequelize.fn('COUNT', sequelize.col('Purchase.id')),
                    'categoryPurchaseCount',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('Purchase.purchasePrice')
                    ),
                    'categoryTotalRevenue',
                ],
            ],
            group: ['Product.Category.id', 'Product.Category.name'],
            order: [
                [sequelize.fn('COUNT', sequelize.col('Purchase.id')), 'DESC'],
            ],
            limit: 1,
            raw: true,
        });

        if (!result) {
            throw new Error('No purchases found');
        }

        const totalProducts = await Product.count({
            where: { categoryId: result.categoryId },
        });

        return {
            id: result.categoryId!,
            name: result.categoryName!,
            totalProducts,
            purchaseCount: result.categoryPurchaseCount!,
            totalRevenue: parseFloat(result.categoryTotalRevenue!.toFixed(2)),
        };
    }

    /**
     * Retrieves the top customers based on the ranking type.
     *
     * @param [getBy='order'] - Which format to retrieve the data by
     * @param [limit=10] - The limit of customers
     * @returns A promise that resolves to an array
     */
    public async getTopCustomers(
        getBy: 'order' | 'purchase' = 'order',
        sortBy: TopCustomerSortBy,
        page: number,
        pageSize: number
    ): Promise<{
        customers: TopCustomersResponse[];
        meta: PageMetaData;
    }> {
        const offset = (page - 1) * pageSize;
        let results: Order[] | Purchase[];
        let recordCount: number;

        if (getBy === 'order') {
            results = await this.getTopCustomersByOrders(
                sortBy,
                pageSize,
                offset
            );

            recordCount = (
                await Order.findAll({
                    include: [
                        {
                            model: Customer,
                            as: 'customer',
                            attributes: [],
                        },
                    ],
                    attributes: [[sequelize.col('customer.id'), 'customerId']],
                    group: ['customer.id'],
                })
            ).length;
        } else {
            results = await this.getTopCustomersByPurchases(
                sortBy,
                pageSize,
                offset
            );

            recordCount = (
                await Purchase.findAll({
                    include: [
                        {
                            model: Order,
                            include: [
                                {
                                    model: Customer,
                                    as: 'customer',
                                    attributes: [],
                                },
                            ],
                            attributes: [],
                        },
                    ],
                    attributes: [
                        [sequelize.col('Order.customer.id'), 'customerId'],
                    ],
                    group: ['Order.customer.id'],
                })
            ).length;
        }

        return {
            customers: results.map((c) => {
                const obj = c.toJSON() as PreparedTopCustomerObject;

                return {
                    id: obj.customerId,
                    firstName: obj.customerFirstName,
                    lastName: obj.customerLastName,
                    username: obj.customerUsername,
                    email: obj.customerEmail,
                    membership: obj.customerMembership,
                    data:
                        getBy === 'order'
                            ? {
                                  orderCount: obj.orderCount!,
                                  totalSpentOnOrders: obj.totalSpent!,
                              }
                            : {
                                  totalProductPurchases: obj.purchaseCount!,
                                  totalSpent: parseFloat(
                                      obj.totalRevenue!.toFixed(2)
                                  ),
                              },
                };
            }),
            meta: {
                page,
                pageSize,
                total: recordCount,
                totalPages: Math.ceil(recordCount / pageSize),
            },
        };
    }

    /**
     * Retrieves the top customers by orders sort parameter.
     *
     * @param sortBy - The sort parameter to use
     * @param pageSize - The number of items per page
     * @param offset - The offset for pagination
     * @returns A promise that resolves to an array of purchases
     */
    private async getTopCustomersByOrders(
        sortBy: TopCustomerSortBy,
        pageSize: number,
        offset: number
    ): Promise<Order[]> {
        return await Order.findAll({
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: [],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: [],
                        },
                    ],
                },
            ],
            attributes: [
                [sequelize.col('customer.id'), 'customerId'],
                [sequelize.col('customer.user.firstName'), 'customerFirstName'],
                [sequelize.col('customer.user.lastName'), 'customerLastName'],
                [sequelize.col('customer.user.username'), 'customerUsername'],
                [sequelize.col('customer.user.email'), 'customerEmail'],
                [sequelize.col('customer.membership'), 'customerMembership'],
                [
                    sequelize.fn('COUNT', sequelize.col('customer.id')),
                    'orderCount',
                ],
                [
                    sequelize.fn('SUM', sequelize.col('Order.total')),
                    'totalSpent',
                ],
            ],
            group: [
                'customer.id',
                'customer.user.firstName',
                'customer.user.lastName',
                'customer.user.username',
                'customer.user.email',
                'customer.membership',
            ],
            order: [[sequelize.literal(sortBy), 'DESC']],
            limit: pageSize,
            offset,
        });
    }

    /**
     * Retrieves the top customers by purchases sort parameter.
     *
     * @param sortBy - The sort parameter to use
     * @param pageSize - The number of items per page
     * @param offset - The offset for pagination
     * @returns A promise that resolves to an array of purchases
     */
    private async getTopCustomersByPurchases(
        sortBy: TopCustomerSortBy,
        pageSize: number,
        offset: number
    ): Promise<Purchase[]> {
        return await Purchase.findAll({
            include: [
                {
                    model: Order,
                    include: [
                        {
                            model: Customer,
                            as: 'customer',
                            attributes: [],
                            include: [
                                {
                                    model: User,
                                    as: 'user',
                                    attributes: [],
                                },
                            ],
                        },
                    ],
                    attributes: [],
                },
            ],
            attributes: [
                [sequelize.col('Order.customer.id'), 'customerId'],
                [
                    sequelize.col('Order.customer.user.firstName'),
                    'customerFirstName',
                ],
                [
                    sequelize.col('Order.customer.user.lastName'),
                    'customerLastName',
                ],
                [
                    sequelize.col('Order.customer.user.username'),
                    'customerUsername',
                ],
                [sequelize.col('Order.customer.user.email'), 'customerEmail'],
                [
                    sequelize.col('Order.customer.membership'),
                    'customerMembership',
                ],
                [
                    sequelize.fn('COUNT', sequelize.col('Order.customer.id')),
                    'purchaseCount',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('Purchase.purchasePrice')
                    ),
                    'totalRevenue',
                ],
            ],
            group: [
                'Order.customer.id',
                'Order.customer.user.firstName',
                'Order.customer.user.lastName',
                'Order.customer.user.username',
                'Order.customer.user.email',
                'Order.customer.membership',
            ],
            order: [[sequelize.literal(sortBy), 'DESC']],
            limit: pageSize,
            offset,
        });
    }

    /**
     * Retrieves the total orders by customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise that resolves to the total orders count
     */
    public async getTotalOrdersByCustomer(
        customerId: number
    ): Promise<{ totalCount: number; totalRevenue: number }> {
        const totalCount = await Order.count({ where: { customerId } });
        const totalRevenue = await Order.sum('total', {
            where: { customerId },
        });

        return { totalCount, totalRevenue };
    }

    /**
     * Retrieves the total product purchases for customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise that resolves to an object containing
     * the total count, revenue and an array of products
     */
    public async getTotalProductPurchasesForCustomer(
        customerId: number
    ): Promise<{
        totalCount: number;
        totalRevenue: number;
        purchasedProducts: PurchasedProductResponse[];
    }> {
        const purchasedProducts = await Purchase.findAll({
            include: [
                {
                    model: Order,
                    include: [
                        {
                            model: Customer,
                            as: 'customer',
                            where: { id: customerId },
                            attributes: [],
                        },
                    ],
                    attributes: [],
                },
                {
                    model: Product,
                    attributes: [],
                },
            ],
            attributes: [
                [sequelize.col('Product.id'), 'purchasedProductId'],
                [sequelize.col('Product.name'), 'productName'],
                [sequelize.col('Product.price'), 'productCurrentPrice'],
                [
                    sequelize.fn('COUNT', sequelize.col('Purchase.id')),
                    'productPurchaseCount',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('Purchase.purchasePrice')
                    ),
                    'totalSpentOnProduct',
                ],
            ],
            group: ['Product.id', 'Product.name', 'Product.price'],
            order: [
                [sequelize.fn('COUNT', sequelize.col('Purchase.id')), 'DESC'],
            ],
            raw: true,
        });

        const totalCount = purchasedProducts.reduce(
            (sum, product) => sum + Number(product.productPurchaseCount),
            0
        );
        const totalRevenue = purchasedProducts.reduce(
            (sum, product) => sum + Number(product.totalSpentOnProduct),
            0
        );

        return {
            totalCount,
            totalRevenue:
                totalCount > 0 ? parseFloat(totalRevenue.toFixed(2)) : 0,
            purchasedProducts:
                totalCount > 0
                    ? purchasedProducts.map((p) => ({
                          id: p.purchasedProductId!,
                          name: p.productName!,
                          currentPrice: p.productCurrentPrice!,
                          purchaseCount: p.productPurchaseCount!,
                          totalSpent: parseFloat(
                              p.totalSpentOnProduct!.toFixed(2)
                          ),
                      }))
                    : [],
        };
    }

    /**
     * Retrieves the category with the most purchases made by customer.
     *
     * @param customerId - The ID of the customer
     * @returns A promise that resolves to an object containing the category response
     */
    public async getCategoryWithMostPurchasesByCustomer(
        customerId: number
    ): Promise<PurchasedCategoryResponse> {
        const result = await Purchase.findOne({
            include: [
                {
                    model: Order,
                    include: [
                        {
                            model: Customer,
                            as: 'customer',
                            where: { id: customerId },
                            attributes: [],
                        },
                    ],
                    attributes: [],
                },
                {
                    model: Product,
                    include: [
                        {
                            model: Category,
                            attributes: [],
                        },
                    ],

                    attributes: [],
                },
            ],
            attributes: [
                [sequelize.col('Product.Category.id'), 'categoryId'],
                [sequelize.col('Product.Category.name'), 'categoryName'],
                [
                    sequelize.fn('COUNT', sequelize.col('Purchase.id')),
                    'purchaseCount',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('Purchase.purchasePrice')
                    ),
                    'totalRevenue',
                ],
            ],
            group: ['Product.Category.id', 'Product.Category.name'],
            order: [
                [sequelize.fn('COUNT', sequelize.col('Purchase.id')), 'DESC'],
            ],
            limit: 1,
            raw: true,
        });

        if (!result) {
            throw new CategoryNotFoundError();
        }

        const totalProducts = await Product.count({
            where: { categoryId: result.categoryId },
        });

        return {
            id: result.categoryId!,
            name: result.categoryName!,
            totalProducts,
            purchaseCount: result.purchaseCount!,
            totalRevenue: parseFloat(result.totalRevenue!.toFixed(2)),
        };
    }

    /**
     * Retrieves the total purchases for each category.
     *
     * @param page - The current page number
     * @param pageSize - The number of items per page
     * @param [sortBy='purchaseCount'] - Sort by the specified column
     * @param [sortOrder='DESC'] - Sorting order
     * @param [minPurchases=0] - The minimum number of purchases for a category
     * @param [minRevenue=0.0] - The minimum revenue for a category
     * @returns A promise resolving to an array of PurchasedCategory objects
     */
    public async getPurchasesPerCategory(
        page: number,
        pageSize: number,
        sortBy: string = 'purchaseCount',
        sortOrder: string = 'DESC',
        minPurchases: number = 0,
        minRevenue: number = 0.0
    ): Promise<{
        categories: PurchasedCategoryResponse[];
        meta: PageMetaData;
    }> {
        const offset = (page - 1) * pageSize;
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
                [sequelize.col('Product.Category.id'), 'categoryId'],
                [sequelize.col('Product.Category.name'), 'categoryName'],
                [
                    sequelize.fn('COUNT', sequelize.col('Product.Category.id')),
                    'purchaseCount',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('Purchase.purchasePrice')
                    ),
                    'totalRevenue',
                ],
            ],
            group: ['Product.Category.id', 'Product.Category.name'],
            having: sequelize.and(
                sequelize.literal(
                    `COUNT(Purchase.productId) >= ${minPurchases}`
                ),
                sequelize.literal(
                    `SUM(Purchase.purchasePrice) >= ${minRevenue}`
                )
            ),
            order: [[sequelize.literal(sortBy), sortOrder]],
            limit: pageSize,
            offset,
        });

        const totalCategoryGroups = (
            await Purchase.findAll({
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
                    [sequelize.col('Product.Category.id'), 'categoryId'],
                ],
                group: ['Product.Category.id'],
                having: sequelize.and(
                    sequelize.literal(
                        `COUNT(Purchase.productId) >= ${minPurchases}`
                    ),
                    sequelize.literal(
                        `SUM(Purchase.purchasePrice) >= ${minRevenue}`
                    )
                ),
            })
        ).length;

        const productsCountMap = new Map<number, number>();

        await Promise.all(
            results.map(async (p) => {
                const categoryId = p.getDataValue('categoryId');
                const productsCount = await Product.count({
                    where: { categoryId },
                });
                productsCountMap.set(categoryId!, productsCount);
            })
        );

        return {
            categories: results.map((p) => ({
                id: p.getDataValue('categoryId')!,
                name: p.getDataValue('categoryName')!,
                totalProducts: productsCountMap.get(
                    p.getDataValue('categoryId')!
                )!,
                purchaseCount: p.getDataValue('purchaseCount')!,
                totalRevenue: parseFloat(
                    p.getDataValue('totalRevenue')!.toFixed(2)
                ),
            })),
            meta: {
                page,
                pageSize,
                total: totalCategoryGroups,
                totalPages: Math.ceil(totalCategoryGroups / pageSize),
            },
        };
    }

    /**
     * Deletes a report in the reports directory.
     *
     * @param reportName - The name of the report to be deleted
     * @returns A promise that resolves to a successful deletion message
     *
     * @throws {@link Error}
     * Thrown if the report is not found or deletion fails.
     */
    public async deleteReport(reportName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const filePath = path.join(reportsDir, reportName);

            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    return reject(new ReportNotFoundError());
                }

                fs.unlink(filePath, (err) => {
                    if (err) {
                        return reject(new Error('Error deleting the report.'));
                    }

                    resolve('Report deleted successfully.');
                });
            });
        });
    }

    /**
     * Deletes all reports of a given type in the reports directory.
     *
     * @param type - The type of report to be deleted
     * @returns A promise that resolves to a successful deletion message
     *
     * @throws {@link Error}
     * Thrown if directory reading or file deletion fails.
     */
    public async deleteAllReportsByType(type: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readdir(reportsDir, (err, files) => {
                if (err) {
                    return reject(
                        new Error(
                            'Error reading the reports directory: ' +
                                err.message
                        )
                    );
                }

                const salesFiles = files.filter((file) =>
                    file.startsWith(type)
                );

                salesFiles.forEach((file) => {
                    const filePath = path.join(reportsDir, file);

                    fs.unlink(filePath, (err) => {
                        if (err) {
                            return reject(
                                new Error(
                                    `Error deleting ${type.charAt(0).toUpperCase() + type.slice(1)} report "${file}":  ${err.message}`
                                )
                            );
                        } else {
                            console.log(
                                `${type.charAt(0).toUpperCase() + type.slice(1)} report "${file}" deleted successfully`
                            );
                        }
                    });
                });

                if (salesFiles.length === 0) {
                    return reject(
                        new ReportNotFoundError(
                            `No reports starting with "${type}" were found`
                        )
                    );
                }

                resolve(`All ${type} reports deleted successfully.`);
            });
        });
    }
}
