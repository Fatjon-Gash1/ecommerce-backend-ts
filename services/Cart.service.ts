import { Cart, CartItem, Customer, Product } from '../models/relational';
import {
    CartNotFoundError,
    CartItemLimitError,
    CartItemNotFoundError,
    ProductNotFoundError,
} from '../errors';

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
     * @returns A promise resolving to a boolean value indicating
     * whether the item was inserted successfully.
     */
    public async addItemToCart(
        userId: number,
        productId: number,
        quantity: number
    ): Promise<object[]> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
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

        const totalCartItems = await CartItem.count({
            where: { cartId: cart.id },
        });

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
        }

        const product = await cart.getProducts({
            where: { id: productId },
            attributes: ['id', 'name', 'imageUrl', 'price'],
            joinTableAttributes: [],
        });

        return product.map((product) => {
            return { ...product.get(), quantity: item.quantity };
        });
    }

    /**
     * Retrieves all items in the customer's cart.
     *
     * @param userId - The user id
     * @returns A promise resolving to an array of CartItem instances
     */
    public async getCartItems(userId: number): Promise<object[]> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        const products = await cart.getProducts({
            attributes: ['id', 'name', 'imageUrl', 'price'],
            joinTableAttributes: ['quantity'],
        });

        return products.map((product) => {
            const { CartItem, ...productData } = product.get({ plain: true });
            return {
                ...productData,
                quantity: CartItem ? CartItem.quantity : null,
            };
        });
    }

    /**
     * Retrieves the total cart items amount.
     *
     * @param userId - The user ID
     * @returns A promise resolving to the total cart items amount
     */
    public async cartCheckout(userId: number): Promise<number> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
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
     * @param userId - The user id
     */
    public async clearCart(userId: number): Promise<void> {
        const cart = await Cart.findOne({
            include: {
                model: Customer,
                where: { userId },
            },
        });

        if (!cart) {
            throw new CartNotFoundError();
        }

        await CartItem.destroy({ where: { cartId: cart.id } });
    }
}
