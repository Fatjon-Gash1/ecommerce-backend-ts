import { getSequelize } from '@/config/db';
import { Op } from 'sequelize';
import client from '@/config/elasticsearch';
import { connectToRedisServer } from '@/config/redis';
import { exclusiveProductRemovalQueue } from '@/queues';
import { NotificationService } from './Notification.service';
import { Admin, Category, Product, User } from '@/models/relational';
import {
    CategoryAlreadyExistsError,
    CategoryNotFoundError,
    ProductNotFoundError,
    ProductAlreadyExistsError,
} from '@/errors';
const redisConnection = connectToRedisServer();
import {
    ProductDetails,
    ProductObject,
    CategoryResponse,
    ProductResponse,
    Promotion,
} from '@/types';
const sequelize = getSequelize();

/**
 * Service responsible for product-related operations.
 */
export class ProductService {
    private notificationService?: NotificationService;

    constructor(notificationService?: NotificationService) {
        this.notificationService = notificationService;
    }

    protected getNotificationService(): NotificationService | null {
        return this.notificationService ?? null;
    }

    /**
     * Creates a new category in the database.
     *
     * @param name - The name of the category
     * @param description - The description of the category
     * @param parentId - The id of the parent category
     * @returns A promise resolving to the created category
     *
     * @throws {@link CategoryAlreadyExistsError}
     * Thrown if the category already exists.
     */
    public async addCategory(
        name: string,
        description: string,
        parentId: number | null
    ): Promise<CategoryResponse> {
        const [category, created] = await Category.findOrCreate({
            where: { name },
            defaults: { name, description, parentId },
        });

        if (!created) {
            throw new CategoryAlreadyExistsError();
        }

        return category.toJSON();
    }

    /**
     * Creates a new product in a given category.
     *
     * @param categoryId - The id of the category
     * @param details - The product creation details
     * @returns A promise that resolves to the created product
     *
     * @throws {@link CategoryNotFoundError}
     * Thrown if the category is not found.
     *
     * @throws {@link ProductAlreadyExistsError}
     * Thrown if the product already exists or if the
     * product image is already in use.
     */
    public async addProductByCategoryId(
        username: string,
        categoryId: number,
        details: ProductDetails,
        promote?: boolean
    ): Promise<ProductResponse> {
        const category = await Category.findByPk(categoryId);

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const [productName, productImage] = await Promise.all([
            Product.findOne({ where: { name: details.name } }),
            Product.findOne({
                where: { imageUrls: details.imageUrls },
            }),
        ]);

        if (productName) {
            throw new ProductAlreadyExistsError();
        }

        if (productImage) {
            throw new ProductAlreadyExistsError('Product image already in use');
        }

        const newProduct = await Product.create({
            categoryId,
            ...details,
        });

        if (details.availableDue) {
            const job = await exclusiveProductRemovalQueue.add(
                'exclusiveProductRemovalJob',
                { productId: newProduct.id, productName: details.name },
                { delay: new Date(details.availableDue).getTime() - Date.now() }
            );

            if (job.id) {
                await redisConnection.hset(
                    'ExclusiveProductRemovalJobs',
                    newProduct.id,
                    job.id
                );
            }
        }

        if (promote) {
            await this.handlePromotions(
                newProduct.id,
                username,
                'newArrival',
                5
            );
        }

        return newProduct.toJSON();
    }

    /**
     * Handles promotions for new product arrivals and discounts
     *
     * @param newProductId - The id of the new product
     * @param username - The username of the admin who added the product
     * @param promotion - The promotion type ('newArrival' or 'discount')
     * @param threshold - The number of products to trigger the promotion
     */
    protected async handlePromotions(
        newProductId: number,
        username: string,
        promotion: Promotion,
        threshold: number
    ): Promise<void> {
        const keyNames = new Map<Promotion, string>([
            ['newArrival', 'newProdArrivalsPromo'],
            ['discount', 'prodDiscountsPromo'],
        ]);
        const promotionKey = `${keyNames.get(promotion)}:` + username;

        await redisConnection.sadd(promotionKey, newProductId);

        const keyLength = await redisConnection.scard(promotionKey);

        if (keyLength >= threshold) {
            const productIds = (
                await redisConnection.smembers(promotionKey)
            ).map(Number);

            const products = (
                await Product.findAll({
                    where: { id: productIds },
                    attributes: ['name', 'price', 'discount', 'imageUrl'],
                })
            ).map((product) => product.toJSON());

            await this.notificationService!.sendPromotionsEmail(
                products,
                promotion
            );

            await redisConnection.del(promotionKey);

            const admin = await Admin.findOne({
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['username'],
                    where: { username },
                },
                attributes: ['userId'],
            });

            if (!admin) {
                throw new Error(
                    `Could not send notification on successful product promotion email to admin with username "${username}". Admin was not found.`
                );
            }
            await this.notificationService!.sendNotification(
                admin.userId,
                (promotion === 'newArrival'
                    ? 'New product arrivals'
                    : 'Discounts') + ' promotion email sent to customers.'
            );
        }
    }

    /**
     * Retrieves all top level categories.
     *
     * @returns A promise resolving to an array of top level Category instances
     */
    public async getAllTopLevelCategories(): Promise<{
        count: number;
        rows: Category[];
    }> {
        const { count, rows } = await Category.findAndCountAll({
            where: { parentId: null },
        });

        return { count, rows };
    }

    /**
     * Retrieves all categories.
     *
     * @returns A promise resolving to an array of Category instances
     */
    public async getAllCategories(): Promise<{
        count: number;
        rows: Category[];
    }> {
        const { count, rows } = await Category.findAndCountAll();

        return { count, rows };
    }

    /**
     * Retrieves all subCategories for a category.
     *
     * @param categoryId - The ID of the category
     * @returns A promise resolving to an object containing the count and rows
     */
    public async getSubCategoriesForCategory(
        categoryId: number
    ): Promise<{ count: number; rows: Category[] }> {
        const foundCategory = await Category.findByPk(categoryId);

        if (!foundCategory) {
            throw new CategoryNotFoundError();
        }

        const { count, rows } = await Category.findAndCountAll({
            where: { parentId: categoryId },
        });

        return { count, rows };
    }

    /**
     * Retrieves all products in the database.
     *
     * @param [exclusive=false] - Whether to fetch exclusive products or not
     * @returns a promise resolving to an array of Product instances
     */
    public async getAllProducts(exclusive: boolean = false): Promise<{
        count: number;
        rows: Product[];
    }> {
        const { count, rows } = await Product.findAndCountAll({
            where: { ...(exclusive ? {} : { availableDue: null }) },
        });

        return { count, rows };
    }

    /**
     * Retrieves all products of a certain category.
     *
     * @param categoryId - The ID of the category
     * @param [exclusive=false] - Whether to fetch exclusive products or not
     * @returns a promise resolving to an array of Product instances
     */
    public async getProductsByCategory(
        categoryId: number,
        exclusive: boolean = false
    ): Promise<{ count: number; rows: Product[] }> {
        const foundCategory = await Category.findByPk(categoryId);

        if (!foundCategory) {
            throw new CategoryNotFoundError();
        }

        const { count, rows } = await Product.findAndCountAll({
            where: {
                categoryId: foundCategory.id,
                ...(exclusive ? {} : { availableDue: null }),
            },
        });

        return { count, rows };
    }

    /**
     * Retrieves a product by ID for admins only.
     *
     * @param productId - The ID of the product
     * @returns a promise resolving to a Product instance
     */
    public async getProductById(productId: number): Promise<Product> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        return product;
    }

    /**
     * Retrieves a product by ID for customers only.
     *
     * @param productId - The ID of the product
     * @param [exclusive=false] - Whether to fetch exclusive products or not
     * @returns a promise resolving to a Product instance
     *
     * @throws {@link ProductNotFoundError}
     * Thrown if the product is not found
     */
    public async viewProductById(
        productId: number,
        exclusive: boolean = false
    ): Promise<Product> {
        const product = await Product.findOne({
            where: {
                id: productId,
                ...(exclusive ? {} : { availableDue: null }),
            },
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        product.views!++;
        return await product.save();
    }

    /**
     * Retrieves the category of a product.
     *
     * @param productId - The id of the product
     * @returns A promise resolving to a Category instance
     *
     * @throws {@link ProductNotFoundError}
     * Thrown if the product is not found.
     *
     * @throws {@link CategoryNotFoundError}
     * Thrown if the category is not found.
     */
    public async getProductCategory(
        productId: number
    ): Promise<CategoryResponse> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        const category = await Category.findByPk(product.categoryId, {
            attributes: { exclude: ['deletedAt'] },
        });

        if (!category) {
            throw new CategoryNotFoundError();
        }

        return category.toJSON();
    }

    /**
     * Retrieves all products by stock status.
     *
     * @param status - The stock status ('inStock' or 'outOfStock')
     * @returns A promise resolving to an array of Product instances
     */
    public async getProductsByStockStatus(status: string): Promise<{
        count: number;
        products: ProductResponse[];
    }> {
        const { count, rows } = await Product.findAndCountAll({
            where:
                status === 'in stock'
                    ? { stockQuantity: { [Op.gt]: 0 } }
                    : { stockQuantity: 0 },
            attributes: { exclude: ['deletedAt'] },
        });

        const products = rows.map((row) => row.toJSON());

        return { count, products };
    }

    /**
     * Updates an existing category
     *
     * @param categoryId - The id of the category to update
     * @param name - The new name of the category
     * @param description - The new description of the category
     * @returns A promise that resolves to the updated category
     *
     * @throws {@link CategoryNotFoundError}
     * Thrown if the category doesn't exist
     */
    public async updateCategoryById(
        categoryId: number,
        name: string,
        description: string
    ): Promise<CategoryResponse> {
        const category = await Category.findByPk(categoryId, {
            attributes: { exclude: ['deletedAt'] },
        });

        if (!category) {
            throw new CategoryNotFoundError();
        }

        await category.update({ name, description });

        return category.toJSON();
    }

    /**
     * Sets the discount for a product.
     *
     * @param username - The admin username
     * @param productId - The id of the product
     * @param discount - The discount to set
     * @param promote - A boolean indicating whether to promote the product
     * @returns A promise resolving to the discount and the new price
     */
    public async setDiscountForProduct(
        username: string,
        productId: number,
        discount: number,
        promote?: boolean
    ): Promise<number> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        product.discount = discount;
        await product.save();

        if (product.discount === 0) {
            return product.price;
        }

        const discountedPrice =
            product.price - (product.price * product.discount!) / 100;

        if (promote) {
            await this.handlePromotions(productId, username, 'discount', 5);
        }

        return Math.ceil(discountedPrice) - 0.01;
    }

    /**
     * Updates an existing product in the database.
     *
     * @param productId - The id of the product to update
     * @param details - The product update details
     * @returns A promise resolving to the updated product
     *
     * @throws {@link ProductNotFoundError}
     * Thrown if the product doesn't exist.
     */
    public async updateProductById(
        productId: number,
        details: ProductDetails
    ): Promise<ProductResponse> {
        const product = await Product.findByPk(productId, {
            attributes: { exclude: ['deletedAt'] },
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        if (
            details.availableDue &&
            details.availableDue !== product.availableDue
        ) {
            const jobId = await redisConnection.hget(
                'ExclusiveProductRemovalJobs',
                productId.toString()
            );

            if (!jobId) {
                throw new Error(
                    'Cannot update product\'s "availabilityDue" date. "exclusiveProductRemovalJob" not found.'
                );
            }

            const job = await exclusiveProductRemovalQueue.getJob(jobId);

            await job.changeDelay(
                new Date(details.availableDue).getTime() - Date.now()
            );
        } else if (details.availableDue === null) {
            const jobId = await redisConnection.hget(
                'ExclusiveProductRemovalJobs',
                productId.toString()
            );

            if (!jobId) {
                throw new Error(
                    'Cannot remove product\'s "availabilityDue" date. "exclusiveProductRemovalJob" not found.'
                );
            }

            await redisConnection.hdel(
                'ExclusiveProductRemovalJobs',
                productId.toString()
            );

            const job = await exclusiveProductRemovalQueue.getJob(jobId);

            await job.remove();
        }

        await product.update(details);

        return product.toJSON();
    }

    /**
     * Deletes a category by id.
     *
     * @param categoryId - The id of the category
     *
     * @throws {@link CategoryNotFoundError}
     * Thrown if the category is not found.
     */
    public async deleteCategoryById(categoryId: number): Promise<void> {
        const transaction = await sequelize.transaction();

        try {
            const category = await Category.findByPk(categoryId, {
                transaction,
            });

            if (!category) {
                throw new CategoryNotFoundError();
            }

            await category.destroy({ transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Deletes a product by id.
     *
     * @param productId - The id of the product
     *
     * @throws {@link ProductNotFoundError}
     * Thrown if the product is not found.
     */
    public async deleteProductById(productId: number): Promise<void> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        await product.destroy();
    }

    /**
     * Searches for products based on a query.
     *
     * @param query - The search query
     * @returns A promise resolving to an array of matched products
     */
    public async searchProducts(query: string): Promise<ProductObject[]> {
        const res = await client.search<ProductObject>({
            index: 'products',
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: ['name', 'description'],
                    },
                },
            },
        });

        return res.hits.hits.map((hit) => hit._source!);
    }
}
