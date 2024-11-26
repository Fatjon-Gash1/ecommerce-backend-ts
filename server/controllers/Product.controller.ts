import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { ProductService, AdminLogsService } from '../services';
import {
    CategoryAlreadyExistsError,
    CategoryNotFoundError,
    ProductNotFoundError,
    ProductAlreadyExistsError,
} from '../errors';

export class ProductController {
    private productService: ProductService;
    private adminLogsService: AdminLogsService | null;

    constructor(
        productService: ProductService,
        adminLogsService: AdminLogsService | null = null
    ) {
        this.productService = productService;
        this.adminLogsService = adminLogsService;
    }

    public async addCategory(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { username } = req.user as JwtPayload;
        const { name, description, parentId } = req.body;

        try {
            const category = await this.productService.addCategory(
                name,
                description,
                parentId
            );
            res.status(201).json({
                message: 'Category created successfully',
                category,
            });

            await this.adminLogsService!.log(username, 'category', 'create');
        } catch (error) {
            if (error instanceof CategoryAlreadyExistsError) {
                console.error('Error adding category: ', error);
                return res.status(400).json({ message: error.message });
            }

            console.error('Error adding category: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async addProductByCategoryId(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const categoryId = Number(req.params.id);
        const { username } = req.user as JwtPayload;
        const { details } = req.body;

        try {
            const product = await this.productService.addProductByCategoryId(
                categoryId,
                details
            );
            res.status(201).json({
                message: 'Product added successfully',
                product,
            });

            this.adminLogsService!.log(username, 'product', 'create');
        } catch (error) {
            if (error instanceof ProductAlreadyExistsError) {
                console.error('Error adding product: ', error);
                return res.status(400).json({ message: error.message });
            }

            console.error('Error adding product: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllTopLevelCategories(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const { count, rows } =
                await this.productService.getAllTopLevelCategories();
            return res.status(200).json({ total: count, categories: rows });
        } catch (error) {
            console.error('Error getting top level categories: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllCategories(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const { count, rows } =
                await this.productService.getAllCategories();
            return res.status(200).json({ total: count, categories: rows });
        } catch (error) {
            console.error('Error getting categories: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getSubCategoriesForCategory(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const categoryId: number = Number(req.params.id);

        try {
            const { count, rows } =
                await this.productService.getSubCategoriesForCategory(
                    categoryId
                );
            return res.status(200).json({ total: count, subcategories: rows });
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error getting subcategories: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error getting subcategories: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllProducts(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const { count, rows } = await this.productService.getAllProducts();
            return res.status(200).json({ total: count, products: rows });
        } catch (error) {
            console.error('Error getting all products: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductsByCategory(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const categoryId: number = Number(req.params.id);

        try {
            const { count, rows } =
                await this.productService.getProductsByCategory(categoryId);
            return res.status(200).json({ total: count, products: rows });
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error getting products by category: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error getting products by category: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId: number = Number(req.params.id);

        try {
            const product = await this.productService.getProductById(productId);
            return res.status(200).json({ product });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error getting product: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error getting product: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async viewProductById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId: number = Number(req.params.id);

        try {
            const product =
                await this.productService.viewProductById(productId);
            return res.status(200).json({ product });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error viewing product: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error viewing product: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductCategory(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId: number = Number(req.params.id);

        try {
            const category =
                await this.productService.getProductCategory(productId);
            return res.status(200).json({ category });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error getting product category: ', error);
                return res.status(404).json({ message: error.message });
            }

            if (error instanceof CategoryNotFoundError) {
                console.error('Error getting product category: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error getting product category: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductsInStock(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const products = await this.productService.getProductsInStock();
            return res.status(200).json({ products });
        } catch (error) {
            console.error('Error getting products in stock: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductsOutOfStock(
        _req: Request,
        res: Response
    ): Promise<void | Response> {
        try {
            const products = await this.productService.getProductsOutOfStock();
            return res.status(200).json({ products });
        } catch (error) {
            console.error('Error getting products out of stock: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getDiscountedPrice(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId: number = Number(req.params.id);

        try {
            const discountedPrice: number =
                await this.productService.getDiscountedPrice(productId);
            return res.status(200).json({ discountedPrice });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error getting discounted price: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error getting discounted price: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateCategoryById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const categoryId: number = Number(req.params.id);
        const { name, description } = req.body;

        try {
            const category = await this.productService.updateCategoryById(
                categoryId,
                name,
                description
            );
            return res.status(200).json({ category });
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error updating category: ', error);
                return res.status(404).json({ message: error.message });
            }
            console.error('Error updating category: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async setDiscountForProduct(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;
        const { discount } = req.body;

        try {
            const discountedPrice: number =
                await this.productService.setDiscountForProduct(
                    productId,
                    discount
                );
            res.status(200).json({
                message: 'Product discount set successfully',
                discountedPrice,
            });

            this.adminLogsService!.log(username, 'product', 'update');
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error setting discount: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error setting discount: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateProduct(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;
        const { details } = req.body;

        try {
            const updatedProduct = await this.productService.updateProduct(
                productId,
                details
            );
            res.status(200).json({
                message: 'Product updated successfully',
                updatedProduct,
            });

            this.adminLogsService!.log(username, 'product', 'update');
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error updating product: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error updating product: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteCategoryById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const categoryId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;

        try {
            await this.productService.deleteCategoryById(categoryId);
            res.sendStatus(204);

            await this.adminLogsService!.log(username, 'category', 'delete');
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error deleting category: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error deleting category: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteProductById(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const productId: number = Number(req.params.id);
        const { username } = req.user as JwtPayload;

        try {
            await this.productService.deleteProductById(productId);
            res.sendStatus(204);

            await this.adminLogsService!.log(username, 'product', 'delete');
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error deleting product: ', error);
                return res.status(404).json({ message: error.message });
            }

            console.error('Error deleting product: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async searchProducts(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { query } = req.query;

        try {
            const products = await this.productService.searchProducts(
                query as string
            );
            return res.status(200).json({ products });
        } catch (error) {
            console.error('Error searching products: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
