import { Request, Response } from 'express';
import { ProductService } from '../services';
import {
    CategoryAlreadyExistsError,
    CategoryNotFoundError,
    ProductNotFoundError,
    ProductAlreadyExistsError,
} from '../errors';

export class ProductController {
    private productService: ProductService;

    constructor(productService: ProductService) {
        this.productService = productService;
    }

    public async addCategory(req: Request, res: Response): Promise<void> {
        const { name, description } = req.body;

        try {
            const category = await this.productService.addCategory(
                name,
                description
            );
            res.status(201).json({
                message: 'Category created successfully',
                category,
            });
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
        const { name } = req.body;

        try {
            const subCategory = await this.productService.addSubCategory(
                name,
                categoryId
            );
            res.status(201).json({
                message: 'Subcategory created successfully',
                subCategory,
            });
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
        const { name, description, subNames } = req.body;

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
        const details = req.body;

        try {
            const product = await this.productService.addProduct(details);
            res.status(201).json({
                message: 'Product added successfully',
                product,
            });
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
        const { productId, discount } = req.body;

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
        const details = req.body;

        try {
            const updatedProduct = await this.productService.updateProduct(
                productId,
                details
            );
            res.status(200).json({
                message: 'Product updated successfully',
                updatedProduct,
            });
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

    public async deleteProductById(req: Request, res: Response): Promise<void> {
        const productId: number = Number(req.params.id);

        try {
            await this.productService.deleteProductById(productId);
            res.sendStatus(204);
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
