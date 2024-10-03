import { Op } from 'sequelize';
import { Category, SubCategory, Product } from '../models/relational';
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

/**
 * Service responsible for product-related operations.
 */
export class ProductService {
    /**
     * Creates a new category in the database.
     * @param name - The name of the category
     * @returns The created category
     *
     * @throws {@link CategoryAlreadyExistsError}
     * Thrown if the category already exists.
     */
    public async addCategory(
        name: string,
        description: string
    ): Promise<Category> {
        const [category, created] = await Category.findOrCreate({
            where: { name },
            defaults: { name, description },
        });

        if (created) {
            throw new CategoryAlreadyExistsError();
        }

        return category;
    }

    /**
     * Creates a new subcategory in the database.
     *
     * @param name - The name of the subcategory
     * @param categoryId - The ID of the parent category
     * @returns The created subcategory
     *
     * @throws {@link CategoryAlreadyExistsError}
     * Thrown if the subcategory already exists.
     */
    public async addSubCategory(
        name: string,
        categoryId: number
    ): Promise<SubCategory> {
        const category = await Category.findByPk(categoryId);

        if (!category) {
            throw new CategoryNotFoundError();
        }

        const [subcategory, created] = await SubCategory.findOrCreate({
            where: { name },
            defaults: { name, categoryId },
        });

        if (!created) {
            throw new CategoryAlreadyExistsError('SubCategory already exists');
        }

        return subcategory;
    }

    /**
     * Creates a new category with subcategories in the database.
     *
     * @param name - The name of the category
     * @description - Category description
     * @subNames - Array of subcategory names
     * @returns An object with the created category and subcategories
     *
     * @throws {@link CategoryAlreadyExistsError}
     * Thrown if the category already exists.
     */
    public async createCategoryWithSubcategories(
        name: string,
        description: string,
        subNames: string[]
    ): Promise<{ category: Category; subcategories: SubCategory[] }> {
        const [category, created] = await Category.findOrCreate({
            where: { name },
            defaults: {
                name,
                description,
            },
        });

        if (!created) {
            throw new CategoryAlreadyExistsError();
        }

        const subcategories = await Promise.all(
            subNames.map(async (subName: string) => {
                return await SubCategory.create({
                    name: subName,
                    categoryId: category.id,
                });
            })
        );

        return { category, subcategories };
    }

    /**
     * Creates a new product in the database.
     * @param details - The product creation details
     * @returns The created product
     * @throws ProductAlreadyExistsError if the product already exists
     */
    public async addProduct(details: ProductDetails): Promise<Product> {
        const [product, created] = await Product.findOrCreate({
            where: { name: details.name },
            defaults: details,
        });

        if (!created) {
            throw new ProductAlreadyExistsError(
                `Product with name: "${details.name}" already exists`
            );
        }

        return product;
    }

    /**
     * Sets the discount for a product.
     *
     * @param productId - The ID of the product
     * @param discount - The discount to set
     * @returns A promise resolving to the updated product
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
        return await this.getDiscountedPrice(productId);
    }

    /**
     * Updates an existing product in the database.
     * @param productId - The id of the product to update
     * @param details - The product update details
     * @returns The updated product
     * @throws ProductNotFoundError if the product doesn't exist
     */
    public async updateProduct(
        productId: number,
        details: ProductDetails
    ): Promise<Product> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        return await product.update(details);
    }

    /**
     * Retrieves all subcategories for a category.
     *
     * @param categoryId - The ID of the category
     * @returns A promise resolving to an object containing the count and rows
     */
    public async getSubcategoriesForCategory(
        categoryId: number
    ): Promise<{ count: number; rows: SubCategory[] }> {
        const foundCategory = await Category.findByPk(categoryId);

        if (!foundCategory) {
            throw new CategoryNotFoundError();
        }

        const { count, rows } = await SubCategory.findAndCountAll({
            where: { categoryId },
        });

        return { count, rows };
    }

    /**
     * Retrieves all products in the database.
     *
     * @returns a promise resolving to an array of Product instances
     */
    public async getAllProducts(): Promise<Product[]> {
        return await Product.findAll();
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
     * @param productId - The ID of the product
     * @returns A promise resolving to a Category instance
     */
    public async getProductCategory(productId: number): Promise<Category> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        const category = await product.getCategory();

        if (!category) {
            throw new CategoryNotFoundError();
        }

        return category;
    }

    /**
     * Retrieves all products that are in stock.
     *
     * @returns A promise resolving to an array of Product instances
     */
    public async getProductsInStock(): Promise<
        Product[] | { message: string }
    > {
        const products = await Product.findAll({
            where: { stockQuantity: { [Op.gt]: 0 } },
        });

        return products;
    }

    /**
     * Retrieves all products that are out of stock.
     *
     * @returns A promise resolving to an array of Product instances
     */
    public async getProductsOutOfStock(): Promise<
        Product[] | { message: string }
    > {
        const products = await Product.findAll({
            where: { stockQuantity: 0 },
        });

        return products;
    }

    /**
     * Calculates the discounted price of a product.
     *
     * @param productId - The ID of the product
     * @returns A promise resolving to the discounted price
     */
    public async getDiscountedPrice(productId: number): Promise<number> {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new ProductNotFoundError();
        }

        if (product.discount === 0) {
            return product.price;
        }
        return product.getPriceWithDiscount();
    }

    /**
     * Deletes a category by ID.
     *
     * @param categoryId - The ID of the category
     */
    public async deleteCategoryById(categoryId: number): Promise<void> {
        const category = await Category.findByPk(categoryId);

        if (!category) {
            throw new CategoryNotFoundError();
        }

        await category.destroy();
    }

    /** Deletes a subcategory by ID.
     *
     * @param subCategoryId - The ID of the subcategory
     */
    public async deleteSubCategoryById(subCategoryId: number): Promise<void> {
        const subCategory = await SubCategory.findByPk(subCategoryId);

        if (!subCategory) {
            throw new CategoryNotFoundError('Subcategory not found');
        }

        await subCategory.destroy();
    }

    /**
     * Deletes a product by ID.
     *
     * @param productId - The ID of the product
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
