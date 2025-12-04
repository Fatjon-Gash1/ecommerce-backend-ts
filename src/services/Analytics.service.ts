import PDFDocument from 'pdfkit-table';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import fs from 'fs';
import path from 'path';
import sequelize, { Op, WhereOptions } from 'sequelize';
import {
    Purchase,
    Product,
    Category,
    Order,
    Customer,
    User,
    Admin,
    CartItem,
    Cart,
} from '@/models/relational';
import {
    CategoryNotFoundError,
    ProductNotFoundError,
    ReportNotFoundError,
    UserNotFoundError,
} from '@/errors';
import {
    OrderResponse,
    PageMetaData,
    PreparedTopCustomerObject,
    ProductResponse,
    PurchasedCategoryResponse,
    PurchasedProductResponse,
    BaseInterval,
    TopCustomerSortBy,
    TopCustomersResponse,
} from '@/types';

const reportsDir = path.join(process.env.BASE_PATH, '../reports');
const assetsDir = path.join(process.env.BASE_PATH, '/assets');
const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
});

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
        const { firstName, lastName } = await this.getAdminData(username);

        const productRevenue = await this.getTotalProductsRevenue();
        const totalRevenue = await this.getTotalRevenue();
        const totalTransactions = await Order.count();
        const averageOrderValue = await this.getAverageOrderValue();
        const purchasesCount = await Purchase.count();
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

        const { doc, availableWidth } = this.initializeReportPDF('sales');

        const salesTable = {
            headers: ['Insight', 'Value'],
            rows: [
                ['Total Sales', formatter.format(productRevenue)],
                [
                    'Total Sales including shipping',
                    formatter.format(totalRevenue),
                ],
                ['Number of Products Sold', purchasesCount.toString()],
                ['Number of Transactions', totalTransactions.toString()],
                ['Average Order Value', formatter.format(averageOrderValue)],
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
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .text(`Categories based on purchases: `);

        const categoriesTable = {
            headers: [
                'Category',
                'Total Products',
                'Total Purchases',
                'Total Revenue',
            ],
            rows: [
                ...categoriesWithPurchases.categories.map((c) => [
                    c.name,
                    c.totalProducts.toString(),
                    c.purchaseCount.toString(),
                    formatter.format(c.totalRevenue),
                ]),
            ],
        };

        const columnWidth = availableWidth / 2 / 4;
        doc.table(categoriesTable, {
            x: doc.x,
            y: doc.y + 10,
            columnsSize: [columnWidth, columnWidth, columnWidth, columnWidth],
            divider: { header: { disabled: true } },
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

        doc.image(image, availableWidth / 2, doc.y - 150, {
            fit: [350, 350],
            align: 'center',
            valign: 'center',
        });

        this.printPDFFooter(doc, { firstName, lastName });
    }

    private async getAdminData(username: string): Promise<{
        firstName: string;
        lastName: string;
    }> {
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

        return { firstName, lastName };
    }

    private initializeReportPDF(
        reportType: string,
        scope?: string,
        reportName?: string,
        tableName?: string
    ): {
        doc: PDFDocument;
        availableWidth: number;
    } {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const upperCased =
            reportType.charAt(0).toUpperCase() + reportType.slice(1);

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        doc.pipe(
            fs.createWriteStream(
                `${reportsDir}/${scope ? scope + '_' : ''}${reportType}_report_${Date.now()}.pdf`
            )
        );
        scope = scope
            ? scope.charAt(0).toUpperCase() + scope.slice(1)
            : undefined;

        doc.image(assetsDir + '/company-logo.png', doc.x, 10, {
            scale: 0.1,
        }).moveDown(2.5);

        doc.font('Helvetica')
            .fontSize(18)
            .text(reportName ?? `${scope ?? 'Generic'} ${upperCased} Report`, {
                align: 'left',
                continued: true,
            });
        doc.fontSize(14).text('Company Name Inc.', { align: 'right' });

        const availableWidth = doc.page.width - doc.page.margins.left * 2;

        doc.moveDown().rect(doc.x, doc.y, availableWidth, 25).fill('#3761a7');

        doc.font('Helvetica-Bold')
            .fillColor('white')
            .fontSize(12)
            .text(
                tableName ?? (scope ? `${scope} ` : '') + upperCased,
                doc.x + 10,
                doc.y + 10
            );
        doc.moveDown(0.25);

        return { doc, availableWidth };
    }

    /**
     * Generates a stock report.
     *
     * @param username - The user's username
     * @returns A promise that resolves to void
     */
    public async generateStockReport(username: string) {
        const { firstName, lastName } = await this.getAdminData(username);

        const inStockProducts = await this.getProductsByStockStatus('in');
        const outOfStockProducts = await this.getProductsByStockStatus('out');

        const { doc, availableWidth } = this.initializeReportPDF('stock');

        const totalProducts = inStockProducts.count + outOfStockProducts.count;
        const productTable = {
            headers: ['stockType', 'amount'],
            rows: [
                ['Total', totalProducts.toString()],
                ['In Stock', inStockProducts.count.toString()],
                ['Out of Stock', outOfStockProducts.count.toString()],
            ],
        };
        doc.table(productTable, {
            hideHeader: true,
            x: doc.x - 10,
        });

        doc.moveDown().rect(doc.x, doc.y, availableWidth, 25).fill('#3761a7');

        doc.font('Helvetica-Bold')
            .fillColor('white')
            .fontSize(12)
            .text('Out of Stock Products', doc.x + 10, doc.y + 10);
        doc.moveDown(0.25);

        const outOfStockProductsTable = {
            headers: [
                'Product Number',
                'Name',
                'Category',
                'Currency',
                'Price',
                'Weight',
                'Type',
            ],
            rows: [
                ...outOfStockProducts.products.map((p) => [
                    p.productNumber,
                    p.name,
                    p.Category!.name,
                    p.currency,
                    formatter.format(p.price),
                    p.weight.toString(),
                    p.availableDue ? 'exclusive' : 'regular',
                ]),
            ],
        };
        doc.table(outOfStockProductsTable, {
            x: doc.x - 10,
            divider: { header: { disabled: true } },
        });

        this.printPDFFooter(doc, { firstName, lastName });
    }

    private printPDFFooter(
        doc: PDFDocument,
        userFields: { [key: string]: string }
    ): void {
        const { firstName, lastName } = userFields;
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
     * Generates a purchases report (singular product purchases).
     *
     * @param username - The user's username
     * @param [interval='full'] - The interval for which the report should be generated
     * @returns A promise that resolves to void
     */
    public async generatePurchasesReport(
        username: string,
        interval: BaseInterval = 'full'
    ) {
        const { firstName, lastName } = await this.getAdminData(username);

        const totalPurchases = await Purchase.count();
        const purchaseData = await this.getTotalProductPurchases(
            1,
            totalPurchases,
            interval
        );

        const { doc } = this.initializeReportPDF('purchases');

        const productPurchasesTable = {
            headers: [
                'Product Number',
                'Name',
                'Category',
                'Currency',
                'Current Price',
                'Weight',
                'Type',
                'Total Purchases',
                'Average Purchase Price',
                'Total Revenue',
            ],
            rows: [
                ...purchaseData.products.map((p) => [
                    p.productNumber!,
                    p.name,
                    p.category!,
                    p.currency!,
                    formatter.format(p.currentPrice),
                    p.weight!.toString(),
                    p.type!,
                    p.purchaseCount.toString(),
                    formatter.format(p.averagePurchasePrice!),
                    formatter.format(p.totalRevenue!),
                ]),
            ],
        };
        doc.table(productPurchasesTable, {
            x: doc.x - 10,
            divider: { header: { disabled: true } },
        });

        this.printPDFFooter(doc, { firstName, lastName });
    }

    /**
     * Generates an orders report.
     *
     * @param username - The user's username
     * @param status - The status of the order
     * @param [interval='full'] - The interval for which the report should be generated
     */
    public async generateOrdersReport(
        username: string,
        status: string,
        interval: BaseInterval = 'full'
    ): Promise<void> {
        const { firstName, lastName } = await this.getAdminData(username);

        const orderData = await this.getOrdersByStatus(status, interval);

        const { doc } = this.initializeReportPDF('orders', status);

        const ordersTable = {
            headers: [
                'Tracking Number',
                'Payment Method',
                'Shipping Country',
                'Shipping Method',
                'Weight Category',
                'Total',
                'Rating',
                'Safe Shipping',
            ],
            rows: [
                ...orderData.orders.map((p) => [
                    p.trackingNumber,
                    p.paymentMethod,
                    p.shippingCountry,
                    p.shippingMethod,
                    p.weightCategory,
                    formatter.format(p.total),
                    p.rating?.toString() ?? 'no rating',
                    p.safeShipping.toString(),
                ]),
            ],
        };
        doc.table(ordersTable, {
            x: doc.x - 10,
            divider: { header: { disabled: true } },
        });

        this.printPDFFooter(doc, { firstName, lastName });
    }

    /**
     * Generates a customer specific purchases report (singular product purchases).
     *
     * @param username - The user's username
     * @param customerId - The customer's id
     * @param [interval='full'] - The interval for which the report should be generated
     * @returns A promise that resolves to void
     */
    public async generateCustomerPurchasesReport(
        username: string,
        customerId: number,
        interval: BaseInterval = 'full'
    ) {
        const { firstName, lastName } = await this.getAdminData(username);

        const customer = await Customer.findByPk(customerId, {
            include: { model: User, as: 'user' },
        });

        if (!customer || !customer.user)
            throw new UserNotFoundError('Customer not found');

        const purchaseData = await this.getTotalProductPurchasesForCustomer(
            customerId,
            interval
        );

        const { doc, availableWidth } = this.initializeReportPDF(
            'purchases',
            'customer',
            undefined,
            'Customer'
        );

        const customerDataTable = {
            headers: [
                'First Name',
                'Last Name',
                'Username',
                'Email',
                'Membership',
                'Active',
                'Total Product Purchases',
                'Total Spent',
            ],
            rows: [
                [
                    customer.user.firstName,
                    customer.user.lastName,
                    customer.user.username,
                    customer.user.email,
                    customer.membership,
                    customer.user.isActive.toString(),
                    purchaseData.totalCount.toString(),
                    formatter.format(purchaseData.totalRevenue),
                ],
            ],
        };
        doc.table(customerDataTable, {
            x: doc.x - 10,
            divider: { header: { disabled: true } },
        });

        doc.moveDown().rect(doc.x, doc.y, availableWidth, 25).fill('#3761a7');

        doc.font('Helvetica-Bold')
            .fillColor('white')
            .fontSize(12)
            .text('Products', doc.x + 10, doc.y + 10);
        doc.moveDown(0.25);

        const productPurchasesTable = {
            headers: [
                'Name',
                'Current Price',
                'Purchase Count',
                'Total Spent on Product',
            ],
            rows: [
                ...purchaseData.purchasedProducts.map((p) => [
                    p.name,
                    formatter.format(p.currentPrice),
                    p.purchaseCount.toString(),
                    formatter.format(p.totalSpent ?? 0),
                ]),
            ],
        };
        doc.table(productPurchasesTable, {
            x: doc.x - 10,
            divider: { header: { disabled: true } },
        });

        this.printPDFFooter(doc, { firstName, lastName });
    }

    /**
     * Generates a customer specific orders report.
     *
     * @param username - The user's username
     * @param customerId - The customer's id
     * @param [status='all'] - The order status
     * @param interval - The interval for which the report should be generated
     * @returns A promise that resolves to void
     */
    public async generateCustomerOrdersReport(
        username: string,
        customerId: number,
        status: string = 'all',
        interval: BaseInterval
    ) {
        const { firstName, lastName } = await this.getAdminData(username);

        const customer = await Customer.findByPk(customerId, {
            include: { model: User, as: 'user' },
        });

        if (!customer || !customer.user)
            throw new UserNotFoundError('Customer not found');

        const ordersData = await this.getTotalOrderRecordsByCustomer(
            customerId,
            status,
            interval
        );

        const { doc, availableWidth } = this.initializeReportPDF(
            'orders',
            status + '_customer',
            status.charAt(0).toUpperCase() +
                status.slice(1) +
                ' Customer Orders',
            'Customer'
        );

        const customerDataTable = {
            headers: [
                'First Name',
                'Last Name',
                'Username',
                'Email',
                'Membership',
                'Active',
                'Total Orders Made',
                'Total Spent on Orders',
            ],
            rows: [
                [
                    customer.user.firstName,
                    customer.user.lastName,
                    customer.user.username,
                    customer.user.email,
                    customer.membership,
                    customer.user.isActive.toString(),
                    ordersData.totalCount.toString(),
                    formatter.format(ordersData.totalRevenue),
                ],
            ],
        };
        doc.table(customerDataTable, {
            x: doc.x - 10,
            divider: { header: { disabled: true } },
        });

        doc.moveDown().rect(doc.x, doc.y, availableWidth, 25).fill('#3761a7');

        doc.font('Helvetica-Bold')
            .fillColor('white')
            .fontSize(12)
            .text('Orders', doc.x + 10, doc.y + 10);
        doc.moveDown(0.25);

        const productPurchasesTable = {
            headers: [
                'Tracking Number',
                'Payment Method',
                'Shipping Country',
                'Shipping Method',
                'Weight Category',
                'Total',
                'Rating',
                'Safe Shipping',
            ],
            rows: [
                ...ordersData.orders.map((p) => [
                    p.trackingNumber,
                    p.paymentMethod,
                    p.shippingCountry,
                    p.shippingMethod,
                    p.weightCategory,
                    formatter.format(p.total),
                    p.rating?.toString() ?? 'no rating',
                    p.safeShipping.toString(),
                ]),
            ],
        };
        doc.table(productPurchasesTable, {
            x: doc.x - 10,
            divider: { header: { disabled: true } },
        });

        this.printPDFFooter(doc, { firstName, lastName });
    }

    /**
     * Retrieves all products by stock status.
     *
     * @param status - The stock status ('in' or 'out')
     * @returns A promise resolving to an array of Product instances and their count
     */
    public async getProductsByStockStatus(status: 'in' | 'out'): Promise<{
        count: number;
        products: ProductResponse[];
    }> {
        const { count, rows } = await Product.findAndCountAll({
            where:
                status === 'in'
                    ? { stockQuantity: { [Op.gt]: 0 } }
                    : { stockQuantity: 0 },
            attributes: {
                exclude: [
                    'deletedAt',
                    'categoryId',
                    'parentId',
                    'description',
                    'discount',
                    'imageUrl',
                    'views',
                ],
            },
            include: [{ model: Category, attributes: ['name'] }],
        });

        return { count, products: rows.map((r) => r.toJSON()) };
    }

    /**
     * Retrieves all platform orders by a given status.
     *
     * @param status - The status of the order
     * @param [interval='full'] - The interval to filter by
     * @returns A promise resolving to an array of Order instances and their count
     */
    private async getOrdersByStatus(
        status: string,
        interval: BaseInterval = 'full'
    ): Promise<{ count: number; orders: OrderResponse[] }> {
        const date = new Date();
        switch (interval) {
            case 'weekly':
                date.setDate(date.getDate() - 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() - 1);
                break;
            case 'full':
                date.setFullYear(0);
                break;
        }

        const { count, rows } = await Order.findAndCountAll({
            where: { status, createdAt: { [Op.gte]: date } },
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
     * @param [interval='full'] - The interval to filter by
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
        interval: BaseInterval = 'full',
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

        const date = new Date();
        switch (interval) {
            case 'weekly':
                date.setDate(date.getDate() - 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() - 1);
                break;
            case 'full':
                date.setFullYear(0);
                break;
        }

        const purchasesCount = await Purchase.count();
        const productPurchases = await Purchase.findAll({
            where: {
                createdAt: { [Op.gte]: date },
            },
            attributes: [
                'productId',
                [
                    sequelize.fn('COUNT', sequelize.col('Purchase.productId')),
                    'purchaseCount',
                ],
                [
                    sequelize.fn(
                        'AVG',
                        sequelize.col('Purchase.purchasePrice')
                    ),
                    'averagePurchasePrice',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.col('Purchase.purchasePrice')
                    ),
                    'totalRevenue',
                ],
            ],
            include: [
                {
                    model: Product,
                    attributes: [
                        'id',
                        'name',
                        'productNumber',
                        'currency',
                        'price',
                        'weight',
                        'availableDue',
                    ],
                    include: [{ model: Category, attributes: ['name'] }],
                },
            ],
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
                              productNumber: o.Product!.productNumber,
                              category: o.Product!.Category!.name,
                              currency: o.Product!.currency,
                              currentPrice: o.Product!.price,
                              weight: o.Product!.weight,
                              type: o.Product!.availableDue
                                  ? 'exclusive'
                                  : 'regular',
                              purchaseCount: parseFloat(
                                  o.purchaseCount!.toFixed(2)
                              ),
                              averagePurchasePrice: parseFloat(
                                  o.averagePurchasePrice!.toFixed(2)
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
     * Retrieves the total orders data by customer.
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
     * Retrieves the total orders by customer.
     *
     * @param customerId - The ID of the customer
     * @param [status='all'] - The order status
     * @param [interval='full'] - The interval to filter by
     * @returns A promise that resolves to the total orders count
     */
    public async getTotalOrderRecordsByCustomer(
        customerId: number,
        status: string = 'all',
        interval: BaseInterval = 'full'
    ): Promise<{
        totalCount: number;
        totalRevenue: number;
        orders: OrderResponse[];
    }> {
        const date = new Date();
        switch (interval) {
            case 'weekly':
                date.setDate(date.getDate() - 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() - 1);
                break;
            case 'full':
                date.setFullYear(0);
                break;
        }

        const whereClause: WhereOptions = {
            where: { customerId, createdAt: { [Op.gte]: date } },
        };

        if (status !== 'all') {
            whereClause.where.status = status;
        }

        const totalCount = await Order.count({ where: { customerId } });
        const totalRevenue = await Order.sum('total', {
            where: { customerId },
        });
        const orders = await Order.findAll({
            ...whereClause,
            raw: true,
        });

        return { totalCount, totalRevenue, orders };
    }

    /**
     * Retrieves the total product purchases for customer.
     *
     * @param customerId - The ID of the customer
     * @param [interval='full'] - The interval to filter by
     * @returns A promise that resolves to an object containing
     * the total count, revenue and an array of products
     */
    public async getTotalProductPurchasesForCustomer(
        customerId: number,
        interval: BaseInterval = 'full'
    ): Promise<{
        totalCount: number;
        totalRevenue: number;
        purchasedProducts: PurchasedProductResponse[];
    }> {
        const date = new Date();
        switch (interval) {
            case 'weekly':
                date.setDate(date.getDate() - 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() - 1);
                break;
            case 'full':
                date.setFullYear(0);
                break;
        }

        const purchasedProducts = await Purchase.findAll({
            where: { createdAt: { [Op.gte]: date } },
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
            (sum, product) =>
                sum +
                parseFloat(
                    product.totalSpentOnProduct
                        ? product.totalSpentOnProduct.toFixed(2)
                        : '0'
                ),
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
     * Retrieves the conversion rate for a given interval.
     * @param [interval='full'] - The interval for which the conversion rate is to be retrieved.
     * @returns A promise resolving to the conversion rate.
     */
    public async getConversionRate(
        interval: BaseInterval = 'full'
    ): Promise<number> {
        const date = new Date();
        switch (interval) {
            case 'weekly':
                date.setDate(date.getDate() - 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() - 1);
                break;
            case 'full':
                date.setFullYear(0);
                break;
        }

        const { ['count']: customers, rows } = await Customer.findAndCountAll({
            where: { createdAt: { [Op.gte]: date } },
            attributes: ['id'],
        });
        const orders = (
            await Order.findAll({
                where: {
                    createdAt: { [Op.gte]: date },
                    customerId: rows.map((r) => r.id),
                },
                attributes: ['customerId'],
                group: ['customerId'],
            })
        ).length;

        return (orders / customers) * 100;
    }

    /**
     * Retrieves the returning customers for a given interval.
     *
     * @param [date] - The interval to fetch for
     * @returns A promise resolving to the returning customer count
     */
    private async getReturningCustomers(date?: Date): Promise<number> {
        const whereClause: WhereOptions = {};

        if (date) {
            whereClause.where.createdAt = { [Op.gte]: date };
        }

        return (
            await Order.findAll({
                ...whereClause,
                attributes: [
                    'customerId',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
                ],
                group: ['customerId'],
                having: sequelize.literal(`COUNT(id) > 1`),
            })
        ).length;
    }

    /**
     * Retrieves the customer acquisition cost for a given interval.
     *
     * @param expenses - The expenses to be considered in the calculation.
     * @param interval - The interval for which the acquisition cost is to be retrieved.
     * @returns A promise resolving to the acquisition cost.
     */
    public async getCustomerAcquisitionCost(
        expenses: number,
        interval: Exclude<BaseInterval, 'full'>
    ): Promise<number> {
        const date = new Date();
        switch (interval) {
            case 'weekly':
                date.setDate(date.getDate() - 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() - 1);
                break;
        }

        const newCustomers = await Customer.count({
            where: { createdAt: { [Op.gte]: date } },
        });

        return (expenses / newCustomers) * 100;
    }

    /**
     * Retrieves the customer acquisition rate for a given interval.
     *
     * @param leads - The number of leads for the acquisition rate calculation.
     * @param interval - The interval for which the acquisition rate is to be retrieved.
     * @returns A promise resolving to the acquisition rate.
     */
    public async getCustomerAcquisitionRate(
        leads: number,
        interval: Exclude<BaseInterval, 'full'>
    ): Promise<number> {
        const date = new Date();
        switch (interval) {
            case 'weekly':
                date.setDate(date.getDate() - 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() - 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() - 1);
                break;
        }

        const newCustomers = await Customer.count({
            where: { createdAt: { [Op.gte]: date } },
        });

        return (newCustomers / leads) * 100;
    }

    /**
     * Retrieves the repeat purchase rate.
     *
     * @returns A promise resolving to the rate.
     */
    public async getRepeatPurchaseRate(): Promise<number> {
        const returningCustomers = await this.getReturningCustomers();
        const totalCustomers = await Customer.count();

        return (returningCustomers / totalCustomers) * 100;
    }

    /**
     * Retrieves the product "Add to Cart Rate".
     *
     * @returns A promise resolving to the rate.
     */
    public async getProductAddToCartRate(productId: number): Promise<number> {
        const product = await Product.findByPk(productId, {
            attributes: ['addToCartRate', 'views'],
            raw: true,
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        if (product.addToCartRate === 0 || product.views === 0) {
            return 0;
        }

        return (product.addToCartRate / product.views) * 100;
    }

    /**
     * Retrieves the product "Add to Cart Rate".
     *
     * @returns A promise resolving to the rate.
     */
    public async getCartAbandonmentRate(): Promise<number> {
        const totalOrders = await Order.count();
        const activeCarts = await Cart.count({ where: { active: true } });

        if (totalOrders === 0 || activeCarts === 0) {
            return 0;
        }

        return (1 - totalOrders / activeCarts) * 100;
    }

    /**
     * Retrieves the current carts populated with items.
     *
     * @returns A promise resolving to the total populated carts.
     */
    public async getPopulatedCarts(): Promise<number> {
        return (
            await CartItem.findAll({
                attributes: ['cartId'],
                group: ['cartId'],
            })
        ).length;
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

                const reportFiles = files.filter((file) => file.includes(type));

                if (reportFiles.length === 0) {
                    return reject(
                        new ReportNotFoundError(
                            `No reports starting with "${type}" were found`
                        )
                    );
                }

                reportFiles.forEach((file) => {
                    const filePath = path.join(reportsDir, file);

                    fs.unlink(filePath, (err) => {
                        if (err) {
                            return reject(
                                new Error(
                                    `Error deleting ${type.charAt(0).toUpperCase() + type.slice(1)} report "${file}":  ${err.message}`
                                )
                            );
                        }
                    });
                });

                resolve(`All ${type} reports deleted successfully.`);
            });
        });
    }
}
