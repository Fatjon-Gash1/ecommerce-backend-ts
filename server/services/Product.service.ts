import { sequelize } from '../config/db';
import { Op } from 'sequelize';
import { Category, Product } from '../models/relational';
import client from '../config/elasticsearchClient';
import {
    CategoryAlreadyExistsError,
    CategoryNotFoundError,
    ProductNotFoundError,
    ProductAlreadyExistsError,
} from '../errors';

interface ProductDetails {
    name: string;
    description: string;
    price: number;
    discount?: number;
    imageUrl: string;
    stockQuantity?: number;
    weight: number;
    views?: number;
}

interface ProductObject {
    name: string;
    description: string;
    price: number;
}

interface CategoryResponse {
    id?: number;
    name: string;
    description: string;
    hasProducts?: boolean;
    parentId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ProductResponse {
    id?: number;
    categoryId?: number;
    name: string;
    description: string;
    price: number;
    discount?: number;
    imageUrl: string;
    stockQuantity?: number;
    weight: number;
    views?: number;
    updatedAt?: Date;
    createdAt?: Date;
}

/**
 * Service responsible for product-related operations.
 */
export class ProductService {
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
        categoryId: number,
        details: ProductDetails
    ): Promise<ProductResponse> {
        const category = await Category.findByPk(categoryId);

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const [productName, productImage] = await Promise.all([
            Product.findOne({ where: { name: details.name } }),
            Product.findOne({ where: { imageUrl: details.imageUrl } }),
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

        return newProduct.toJSON();
    }
    /*// Product addition threshold for sending product promotions email
            let productsForPromotion: number = 0; // Will be converted to an array of Products in the future
        const promotionThreshold: number = 10;

    Product.afterCreate(async () => {
        productsForPromotion++;

        if (productsForPromotion === promotionThreshold) {
            await notificationService.sendNewPromotionsEmail();
            productsForPromotion = 0;
        }
    });
    */

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
     * @returns a promise resolving to an array of Product instances
     */
    public async getAllProducts(): Promise<{
        count: number;
        rows: Product[];
    }> {
        const { count, rows } = await Product.findAndCountAll();

        return { count, rows };
    }

    /**
     * Retrieves all products of a certain category.
     *
     * @param categoryId - The ID of the category
     * @returns a promise resolving to an array of Product instances
     */
    public async getProductsByCategory(
        categoryId: number
    ): Promise<{ count: number; rows: Product[] }> {
        const foundCategory = await Category.findByPk(categoryId);

        if (!foundCategory) {
            throw new CategoryNotFoundError();
        }

        const { count, rows } = await Product.findAndCountAll({
            where: { categoryId: foundCategory.id },
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
     * @returns a promise resolving to a Product instance
     *
     * @throws {@link ProductNotFoundError}
     * Thrown if the product is not found
     */
    public async viewProductById(productId: number): Promise<Product> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        product.views! += 1;
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
     * Retrieves the product's discounted price.
     *
     * @param productId - The id of the product
     *
     * @returns A promise resolving to the discounted price
     *
     * @throws {@link ProductNotFoundError}
     * Thrown if the product is not found.
     */
    public async getDiscountedPrice(productId: number): Promise<number> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        if (product.discount === 0) {
            return product.price;
        }

        const discountedPrice =
            product.price - (product.price * product.discount!) / 100;

        return Math.ceil(discountedPrice) - 0.01;
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
     * @param productId - The id of the product
     * @param discount - The discount to set
     * @returns A promise resolving to the discount and the new price
     */
    public async setDiscountForProduct(
        productId: number,
        discount: number
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
