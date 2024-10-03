import { Request, Response } from 'express';
import { ProductService, AdminLogsService } from '../services';
import {
    CategoryAlreadyExistsError,
    CategoryNotFoundError,
    ProductNotFoundError,
    ProductAlreadyExistsError,
} from '../errors';

export class ProductController {
    private productService: ProductService;
    private adminLogsService: AdminLogsService;

    constructor(
        productService: ProductService,
        adminLogsService: AdminLogsService
    ) {
        this.productService = productService;
        this.adminLogsService = adminLogsService;
    }

    public async addCategory(req: Request, res: Response): Promise<void> {
        const { username, name, description } = req.body;

        try {
            const category = await this.productService.addCategory(
                name,
                description
            );
            res.status(201).json({
                message: 'Category created successfully',
                category,
            });

            await this.adminLogsService.log(username, 'category', 'create');
        } catch (error) {
            if (error instanceof CategoryAlreadyExistsError) {
                console.error('Error adding category: ', error);
                res.status(400).json({ message: error.message });
                return;
            }

            console.error('Error adding category: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async addSubCategory(req: Request, res: Response): Promise<void> {
        const categoryId = Number(req.params.id);
        const { username, name } = req.body;

        try {
            const subCategory = await this.productService.addSubCategory(
                name,
                categoryId
            );
            res.status(201).json({
                message: 'Subcategory created successfully',
                subCategory,
            });

            this.adminLogsService.log(username, 'subcategory', 'create');
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error adding subcategory: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            if (error instanceof CategoryAlreadyExistsError) {
                console.error('Error adding subcategory: ', error);
                res.status(400).json({ message: error.message });
                return;
            }

            console.error('Error adding subcategory: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async createCategoryWithSubcategories(
        req: Request,
        res: Response
    ): Promise<void> {
        const { username, name, description, subNames } = req.body;

        try {
            const { category, subcategories } =
                await this.productService.createCategoryWithSubcategories(
                    name,
                    description,
                    subNames
                );
            res.status(201).json({
                message: 'Category and subcategories created successfully',
                category,
                subcategories,
            });

            this.adminLogsService.log(username, 'category', 'create');
        } catch (error) {
            if (error instanceof CategoryAlreadyExistsError) {
                console.error(
                    'Error creating category and subcategories: ',
                    error
                );
                res.status(400).json({ message: error.message });
                return;
            }

            console.error('Error creating category and subcategories: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async addProduct(req: Request, res: Response): Promise<void> {
        const { username, details } = req.body;

        try {
            const product = await this.productService.addProduct(details);
            res.status(201).json({
                message: 'Product added successfully',
                product,
            });

            this.adminLogsService.log(username, 'product', 'create');
        } catch (error) {
            if (error instanceof ProductAlreadyExistsError) {
                console.error('Error adding product: ', error);
                res.status(400).json({ message: error.message });
                return;
            }

            console.error('Error adding product: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async setDiscountForProduct(
        req: Request,
        res: Response
    ): Promise<void> {
        const { username, productId, discount } = req.body;

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

            this.adminLogsService.log(username, 'product', 'update');
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error setting discount: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error setting discount: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async updateProduct(req: Request, res: Response): Promise<void> {
        const productId: number = Number(req.params.id);
        const { username, details } = req.body;

        try {
            const updatedProduct = await this.productService.updateProduct(
                productId,
                details
            );
            res.status(200).json({
                message: 'Product updated successfully',
                updatedProduct,
            });

            this.adminLogsService.log(username, 'product', 'update');
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error updating product: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error updating product: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getSubcategoriesForCategory(
        req: Request,
        res: Response
    ): Promise<void> {
        const categoryId: number = Number(req.params.id);

        try {
            const { count, rows } =
                await this.productService.getSubcategoriesForCategory(
                    categoryId
                );
            res.status(200).json({ total: count, rows });
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error getting subcategories: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting subcategories: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getAllProducts(_req: Request, res: Response): Promise<void> {
        try {
            const products = await this.productService.getAllProducts();
            res.status(200).json(products);
        } catch (error) {
            console.error('Error getting all products: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductsByCategory(
        req: Request,
        res: Response
    ): Promise<void> {
        const categoryId: number = Number(req.params.id);

        try {
            const { count, rows } =
                await this.productService.getProductsByCategory(categoryId);
            res.status(200).json({ total: count, rows });
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error getting products by category: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting products by category: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductById(req: Request, res: Response): Promise<void> {
        const productId: number = Number(req.params.id);

        try {
            const product = await this.productService.getProductById(productId);
            res.status(200).json({ product });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error getting product: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting product: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async viewProductById(req: Request, res: Response): Promise<void> {
        const productId: number = Number(req.params.id);

        try {
            const product =
                await this.productService.viewProductById(productId);
            res.status(200).json({ product });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error viewing product: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error viewing product: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductCategory(
        req: Request,
        res: Response
    ): Promise<void> {
        const productId: number = Number(req.params.id);

        try {
            const category =
                await this.productService.getProductCategory(productId);
            res.status(200).json({ category });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error getting product category: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            if (error instanceof CategoryNotFoundError) {
                console.error('Error getting product category: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting product category: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductsInStock(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const products = await this.productService.getProductsInStock();
            res.status(200).json({ products });
        } catch (error) {
            console.error('Error getting products in stock: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getProductsOutOfStock(
        _req: Request,
        res: Response
    ): Promise<void> {
        try {
            const products = await this.productService.getProductsOutOfStock();
            res.status(200).json({ products });
        } catch (error) {
            console.error('Error getting products out of stock: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getDiscountedPrice(
        req: Request,
        res: Response
    ): Promise<void> {
        const productId: number = Number(req.params.id);

        try {
            const discountedPrice: number =
                await this.productService.getDiscountedPrice(productId);
            res.status(200).json({ discountedPrice });
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error getting discounted price: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting discounted price: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteCategoryById(
        req: Request,
        res: Response
    ): Promise<void> {
        const categoryId: number = Number(req.params.id);
        const { username } = req.body;

        try {
            await this.productService.deleteCategoryById(categoryId);
            res.sendStatus(204);

            await this.adminLogsService.log(username, 'category', 'delete');
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error deleting category: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error deleting category: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteSubCategoryById(
        req: Request,
        res: Response
    ): Promise<void> {
        const categoryId: number = Number(req.params.id);
        const { username } = req.body;

        try {
            await this.productService.deleteSubCategoryById(categoryId);
            res.sendStatus(204);

            await this.adminLogsService.log(username, 'subcategory', 'delete');
        } catch (error) {
            if (error instanceof CategoryNotFoundError) {
                console.error('Error deleting subcategory: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error deleting subcategory: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async deleteProductById(req: Request, res: Response): Promise<void> {
        const productId: number = Number(req.params.id);
        const { username } = req.body;

        try {
            await this.productService.deleteProductById(productId);
            res.sendStatus(204);

            await this.adminLogsService.log(username, 'product', 'delete');
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                console.error('Error deleting product: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error deleting product: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async searchProducts(req: Request, res: Response): Promise<void> {
        const { query } = req.query;

        try {
            const products = await this.productService.searchProducts(
                query as string
            );
            res.status(200).json({ products });
        } catch (error) {
            console.error('Error searching products: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
