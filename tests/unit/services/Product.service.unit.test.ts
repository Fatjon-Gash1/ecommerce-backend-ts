import { NotificationService, ProductService } from '@/services';
import { Product, Category } from '@/models/relational';
import {
    CategoryNotFoundError,
    ProductAlreadyExistsError,
    ProductNotFoundError,
} from '@/errors';
import { ProductDetails, Promotion } from '@/types';
import { exclusiveProductRemovalQueue } from '@/queues';
import { connectToRedisServer } from '@/config/redis';
import type Redis from 'ioredis';

class TestableProductService extends ProductService {
    public override handlePromotions(
        newProductId: number,
        username: string,
        promotion: Promotion,
        threshold: number
    ): Promise<void> {
        return super.handlePromotions(
            newProductId,
            username,
            promotion,
            threshold
        );
    }

    public exposedNotificationService = this.getNotificationService()!;
}

describe('ProductService', () => {
    const productService = new TestableProductService(
        new NotificationService()
    );

    beforeEach(() => {
        jest.spyOn(productService, 'handlePromotions').mockResolvedValue(
            undefined
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addProductByCategoryId', () => {
        const productDetails: ProductDetails = {
            name: 'Product 1',
            description: 'this is a description',
            currency: 'USD',
            price: 12.99,
            imageUrls: ['https://example.com/image1.jpg'],
            weight: 0.5,
        };

        const baseProductContent = {
            id: 2,
            name: 'Apple',
            imageUrls: ['https://example.com/apple.jpg'],
            price: 10.99,
        };
        let mockProductInstance: Partial<Product>;
        let redisConnection: Redis;

        beforeEach(() => {
            mockProductInstance = {
                ...baseProductContent,
                save: jest.fn(),
                toJSON: jest.fn().mockReturnValue({
                    ...baseProductContent,
                }),
            } as unknown as Product;
            redisConnection = connectToRedisServer();
        });

        it('should throw CategoryNotFoundError if category is not found', async () => {
            (Category.findByPk as jest.Mock).mockResolvedValue(null);

            await expect(
                productService.addProductByCategoryId(
                    'john_doe',
                    1,
                    productDetails
                )
            ).rejects.toThrow(CategoryNotFoundError);

            expect(Category.findByPk).toHaveBeenCalled();
            expect(Product.findOne).not.toHaveBeenCalled();
        });

        it('should throw ProductAlreadyExistsError if product already exists', async () => {
            (Category.findByPk as jest.Mock).mockResolvedValue({});
            (Product.findOne as jest.Mock).mockResolvedValueOnce(
                mockProductInstance
            );
            (Product.findOne as jest.Mock).mockResolvedValueOnce(null);

            await expect(
                productService.addProductByCategoryId(
                    'john_doe',
                    1,
                    productDetails
                )
            ).rejects.toThrow(ProductAlreadyExistsError);

            expect(Category.findByPk).toHaveBeenCalled();
            expect((Product.findOne as jest.Mock).mock.calls.length).toBe(2);
            expect(Product.create).not.toHaveBeenCalled();
        });

        it('should throw ProductAlreadyExistsError if product image already in use', async () => {
            (Category.findByPk as jest.Mock).mockResolvedValue({});
            (Product.findOne as jest.Mock).mockResolvedValueOnce(null);
            (Product.findOne as jest.Mock).mockResolvedValueOnce(
                mockProductInstance
            );

            await expect(
                productService.addProductByCategoryId(
                    'john_doe',
                    1,
                    productDetails
                )
            ).rejects.toThrow('Product image already in use');

            expect(Category.findByPk).toHaveBeenCalled();
            expect((Product.findOne as jest.Mock).mock.calls.length).toBe(2);
            expect(Product.create).not.toHaveBeenCalled();
        });

        it('should create a new exclusive product with promotion', async () => {
            (Category.findByPk as jest.Mock).mockResolvedValue({});
            (Product.findOne as jest.Mock).mockResolvedValue(null);
            (Product.create as jest.Mock).mockResolvedValue(
                mockProductInstance
            );
            (exclusiveProductRemovalQueue.add as jest.Mock).mockResolvedValue({
                id: 1,
            });

            const result = await productService.addProductByCategoryId(
                'john_doe',
                1,
                { ...productDetails, availableDue: new Date() },
                true
            );

            expect(Category.findByPk).toHaveBeenCalled();
            expect((Product.findOne as jest.Mock).mock.calls.length).toBe(2);
            expect(Product.create).toHaveBeenCalled();
            expect(exclusiveProductRemovalQueue.add).toHaveBeenCalled();
            expect(redisConnection.hset).toHaveBeenCalled();
            expect(productService.handlePromotions).toHaveBeenCalledWith(
                mockProductInstance.id,
                'john_doe',
                'newArrival',
                5
            );
            expect(result).toStrictEqual(baseProductContent);
        });

        it('should create a new product without promotion', async () => {
            (Category.findByPk as jest.Mock).mockResolvedValue({});
            (Product.findOne as jest.Mock).mockResolvedValue(null);
            (Product.create as jest.Mock).mockResolvedValue(
                mockProductInstance
            );

            const result = await productService.addProductByCategoryId(
                'john_doe',
                1,
                productDetails
            );

            expect(Category.findByPk).toHaveBeenCalled();
            expect((Product.findOne as jest.Mock).mock.calls.length).toBe(2);
            expect(Product.create).toHaveBeenCalled();
            expect(exclusiveProductRemovalQueue.add).not.toHaveBeenCalled();
            expect(redisConnection.hset).not.toHaveBeenCalled();
            expect(productService.handlePromotions).not.toHaveBeenCalled();
            expect(result).toStrictEqual(baseProductContent);
        });
    });

    describe('setDiscountForProduct', () => {
        const baseProductContent = {
            id: 2,
            name: 'Apple',
            imageUrls: ['https://example.com/apple.jpg'],
            price: 10.99,
            discount: 0,
        };
        let mockProductInstance: Partial<Product>;

        beforeEach(() => {
            mockProductInstance = {
                ...baseProductContent,
                save: jest.fn(),
                toJSON: jest.fn().mockReturnValue({
                    ...baseProductContent,
                }),
            } as unknown as Product;
        });

        it('should throw ProductNotFoundError if product is not found', async () => {
            (Product.findByPk as jest.Mock).mockResolvedValue(null);

            await expect(
                productService.setDiscountForProduct('john_doe', 1, 50)
            ).rejects.toThrow(ProductNotFoundError);
        });

        it('should return product price if no discount left', async () => {
            (Product.findByPk as jest.Mock).mockResolvedValue(
                mockProductInstance
            );

            const result = await productService.setDiscountForProduct(
                'john_doe',
                1,
                0
            );

            expect(mockProductInstance.save).toHaveBeenCalled();
            expect(result).toStrictEqual(mockProductInstance.price);
        });

        it('should return discounted product price with promotion', async () => {
            (Product.findByPk as jest.Mock).mockResolvedValue(
                mockProductInstance
            );

            const result = await productService.setDiscountForProduct(
                'john_doe',
                1,
                50,
                true
            );

            expect(mockProductInstance.save).toHaveBeenCalled();
            expect(productService.handlePromotions).toHaveBeenCalled();
            expect(result).not.toStrictEqual(mockProductInstance.price);
        });
    });
});

afterAll(async () => {
    if (exclusiveProductRemovalQueue.close)
        await exclusiveProductRemovalQueue.close();
});
