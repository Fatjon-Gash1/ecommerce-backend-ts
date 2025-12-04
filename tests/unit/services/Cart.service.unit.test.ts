import { CartService } from '@/services';
import { Customer, Cart, Product, CartItem } from '@/models/relational';
import {
    CartItemLimitError,
    CartNotFoundError,
    ProductNotFoundError,
} from '@/errors';

describe('CartService', () => {
    const cartService = new CartService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addItemToCart', () => {
        const mockCartData = {
            userId: 1,
            productId: 2,
            quantity: 10,
        };
        const baseProductContent = {
            id: 2,
            name: 'Apple',
            imageUrls: ['https://example.com/apple.jpg'],
            price: 10.99,
        };
        const cartItemResponse = [
            {
                ...baseProductContent,
                quantity: 10,
            },
        ];

        let mockCartInstance: Partial<Cart>;
        let mockProductInstance: Partial<Product>;
        let mockCartItemInstance: Partial<CartItem>;

        beforeEach(() => {
            mockProductInstance = {
                ...baseProductContent,
                save: jest.fn(),
                toJSON: jest.fn().mockReturnValue({
                    CartItem: { quantity: 10 },
                    ...baseProductContent,
                }),
            } as unknown as Product;
            mockCartInstance = {
                countProducts: jest.fn().mockResolvedValue(10),
                getProducts: jest.fn().mockResolvedValue([
                    {
                        ...baseProductContent,
                        toJSON: jest.fn().mockReturnValue({
                            CartItem: { quantity: 10 },
                            ...baseProductContent,
                        }),
                    },
                ]),
            };
            mockCartItemInstance = {
                save: jest.fn(),
                quantity: 10,
            } as unknown as CartItem;
        });

        it('should throw CartNotFoundError if cart is not found', async () => {
            (Cart.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                cartService.addItemToCart(
                    mockCartData.userId,
                    mockCartData.productId,
                    mockCartData.quantity
                )
            ).rejects.toThrow(CartNotFoundError);

            expect(Cart.findOne).toHaveBeenCalledWith({
                include: {
                    model: Customer,
                    as: 'customer',
                    where: { userId: mockCartData.userId },
                },
            });
            expect(Product.findByPk).not.toHaveBeenCalled();
        });

        it('should throw ProductNotFoundError if passed product is not found', async () => {
            (Cart.findOne as jest.Mock).mockResolvedValue(mockCartInstance);
            (Product.findByPk as jest.Mock).mockResolvedValue(null);

            await expect(
                cartService.addItemToCart(
                    mockCartData.userId,
                    mockCartData.productId,
                    mockCartData.quantity
                )
            ).rejects.toThrow(ProductNotFoundError);

            expect(Cart.findOne).toHaveBeenCalledWith({
                include: {
                    model: Customer,
                    as: 'customer',
                    where: { userId: mockCartData.userId },
                },
            });
            expect(Product.findByPk).toHaveBeenCalledWith(
                mockCartData.productId
            );
            expect(mockCartInstance.countProducts).not.toHaveBeenCalled();
        });

        it('should throw CartItemLimitError if cart items count is equal to or exceeds the limit', async () => {
            (Cart.findOne as jest.Mock).mockResolvedValue(mockCartInstance);
            (Product.findByPk as jest.Mock).mockResolvedValue(
                mockProductInstance
            );
            (mockCartInstance.countProducts as jest.Mock).mockResolvedValue(
                101
            );

            await expect(
                cartService.addItemToCart(
                    mockCartData.userId,
                    mockCartData.productId,
                    mockCartData.quantity
                )
            ).rejects.toThrow(CartItemLimitError);

            expect(Cart.findOne).toHaveBeenCalledWith({
                include: {
                    model: Customer,
                    as: 'customer',
                    where: { userId: mockCartData.userId },
                },
            });
            expect(Product.findByPk).toHaveBeenCalledWith(
                mockCartData.productId
            );
            expect(mockCartInstance.countProducts).toHaveBeenCalled();
            expect(CartItem.findOrCreate).not.toHaveBeenCalled();
        });

        it('should increment the quantity of the item in the cart', async () => {
            (Cart.findOne as jest.Mock).mockResolvedValue(mockCartInstance);
            (Product.findByPk as jest.Mock).mockResolvedValue(
                mockProductInstance
            );
            (CartItem.findOrCreate as jest.Mock).mockResolvedValue([
                mockCartItemInstance,
                false,
            ]);

            const result = await cartService.addItemToCart(
                mockCartData.userId,
                mockCartData.productId,
                mockCartData.quantity
            );

            expect(Cart.findOne).toHaveBeenCalledWith({
                include: {
                    model: Customer,
                    as: 'customer',
                    where: { userId: mockCartData.userId },
                },
            });
            expect(Product.findByPk).toHaveBeenCalledWith(
                mockCartData.productId
            );
            expect(mockCartInstance.countProducts).toHaveBeenCalled();
            expect(CartItem.findOrCreate).toHaveBeenCalledWith({
                where: {
                    cartId: mockCartInstance.id,
                    productId: mockProductInstance.id,
                },
                defaults: {
                    cartId: mockCartInstance.id,
                    productId: mockProductInstance.id,
                    quantity: mockCartData.quantity,
                },
            });
            expect(mockCartItemInstance.save).toHaveBeenCalled();
            expect(mockProductInstance.save).not.toHaveBeenCalled();
            expect(mockCartInstance.getProducts).toHaveBeenCalled();
            expect(result).toStrictEqual(cartItemResponse);
        });

        it('should create a new cart item and increment the add to cart rate of that product', async () => {
            (Cart.findOne as jest.Mock).mockResolvedValue(mockCartInstance);
            (Product.findByPk as jest.Mock).mockResolvedValue(
                mockProductInstance
            );
            (CartItem.findOrCreate as jest.Mock).mockResolvedValue([
                mockCartItemInstance,
                true,
            ]);

            const result = await cartService.addItemToCart(
                mockCartData.userId,
                mockCartData.productId,
                mockCartData.quantity
            );

            expect(Cart.findOne).toHaveBeenCalledWith({
                include: {
                    model: Customer,
                    as: 'customer',
                    where: { userId: mockCartData.userId },
                },
            });
            expect(Product.findByPk).toHaveBeenCalledWith(
                mockCartData.productId
            );
            expect(mockCartInstance.countProducts).toHaveBeenCalled();
            expect(CartItem.findOrCreate).toHaveBeenCalledWith({
                where: {
                    cartId: mockCartInstance.id,
                    productId: mockProductInstance.id,
                },
                defaults: {
                    cartId: mockCartInstance.id,
                    productId: mockProductInstance.id,
                    quantity: mockCartData.quantity,
                },
            });
            expect(mockCartItemInstance.save).not.toHaveBeenCalled();
            expect(mockProductInstance.save).toHaveBeenCalled();
            expect(mockCartInstance.getProducts).toHaveBeenCalled();
            expect(result).toStrictEqual(cartItemResponse);
        });
    });
});
