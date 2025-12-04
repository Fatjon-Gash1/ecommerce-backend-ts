import { Cart, CartItem, Customer, Product } from '@/models/relational';
import {
    CartNotFoundError,
    CartItemLimitError,
    CartItemNotFoundError,
    ProductNotFoundError,
} from '@/errors';
import { CartItemResponse } from '@/types';

const CART_ITEM_LIMIT = 100;

/**
 * Service responsible for Customer Cart-related operations.
 */
export class CartService {
    /**
     * Inserts an item into the cart.
     *
     * @param userId - The user id.
     * @param productId - The id of the product to insert.
     * @param quantity - The product quantity.
     * @returns A promise resolving to an array of the updated cart items
     */
    public async addItemToCart(
        userId: number,
        productId: number,
        quantity: number
    ): Promise<CartItemResponse[]> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                as: 'customer',
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        const foundProduct = await Product.findByPk(productId);

        if (!foundProduct) {
            throw new ProductNotFoundError();
        }

        const totalCartItems = await cart.countProducts();

        if (totalCartItems >= CART_ITEM_LIMIT) {
            throw new CartItemLimitError(
                `Cart item limit reached. You cannot add more than "${CART_ITEM_LIMIT}" items.`
            );
        }

        const [item, created] = await CartItem.findOrCreate({
            where: { cartId: cart.id, productId },
            defaults: {
                cartId: cart.id,
                productId,
                quantity,
            },
        });

        if (!created) {
            item.quantity += quantity;
            await item.save();
        } else {
            foundProduct.addToCartRate++;
            await foundProduct.save();
        }

        const products = await cart.getProducts({
            attributes: ['id', 'name', 'imageUrls', 'price'],
            joinTableAttributes: ['quantity'],
        });

        return products.map((item) => {
            const { ['CartItem']: cartItem, ...product } = item.toJSON();
            return { ...product, quantity: cartItem!.quantity };
        });
    }

    /**
     * Retrieves all items in the customer's cart.
     *
     * @param userId - The user id
     * @returns A promise resolving to an array of cart items
     */
    public async getCartItems(userId: number): Promise<CartItemResponse[]> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                as: 'customer',
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        const products = await cart.getProducts({
            attributes: ['id', 'name', 'imageUrls', 'price'],
            joinTableAttributes: ['quantity'],
        });

        return products.map((item) => {
            const { ['CartItem']: cartItem, ...product } = item.toJSON();
            return { ...product, quantity: cartItem!.quantity };
        });
    }

    /**
     * Retrieves the total cart items amount.
     *
     * @param userId - The user ID
     * @returns A promise resolving to a number representing the total cart items amount
     */
    public async cartCheckout(userId: number): Promise<number> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                as: 'customer',
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        return await cart.getTotalPrice();
    }

    /**
     *
     * Removes an item from the customer's cart.
     * @param userId - The user id
     * @param productId - The ID of the product to remove
     */
    public async removeItemFromCart(
        userId: number,
        productId: number
    ): Promise<void> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                as: 'customer',
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        const item = await CartItem.findOne({
            where: { cartId: cart.id, productId },
        });

        if (!item) {
            throw new CartItemNotFoundError();
        }

        if (item.quantity > 1) {
            item.quantity--;
            await item.save();
        } else {
            await item.destroy();
        }
    }

    /**
     * Clears the customer's cart.
     *
     * @param userId - The user id of the cart owner
     */
    public async clearCart(userId: number): Promise<void> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                as: 'customer',
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        await cart.removeProducts();
    }
}
