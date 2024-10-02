import { Request, Response } from 'express';
import { CartService } from '../services';
import { CartNotFoundError, CartItemNotFoundError } from '../errors';

export class CartController {
    private cartService: CartService;

    constructor(cartService: CartService) {
        this.cartService = cartService;
    }

    public async addItemToCart(req: Request, res: Response): Promise<void> {
        const customerId: number = Number(req.params.id);
        const { productId, quantity } = req.body;

        try {
            const cartItem = await this.cartService.addItemToCart(
                customerId,
                productId,
                quantity
            );
            res.status(201).json({ cartItem });
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                console.error('Error adding item to cart: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error adding item to cart: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCartItems(req: Request, res: Response): Promise<void> {
        const customerId: number = Number(req.params.id);

        try {
            const cartItems = await this.cartService.getCartItems(customerId);
            res.status(200).json({ cartItems });
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                console.error('Error getting cart items: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error getting cart items: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async removeItemFromCart(
        req: Request,
        res: Response
    ): Promise<void> {
        const customerId: number = Number(req.params.id);
        const { productId } = req.body;

        try {
            await this.cartService.removeItemFromCart(customerId, productId);
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                console.error('Error removing item from cart: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            if (error instanceof CartItemNotFoundError) {
                console.error('Error removing item from cart: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error removing item from cart: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async clearCart(req: Request, res: Response): Promise<void> {
        const customerId: number = Number(req.params.id);

        try {
            await this.cartService.clearCart(customerId);
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                console.error('Error clearing cart: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error clearing cart: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    public async cartCheckout(req: Request, res: Response): Promise<void> {
        const customerId: number = Number(req.params.id);

        try {
            const totalPrice = await this.cartService.cartCheckout(customerId);
            res.status(200).json({ totalPrice });
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                console.error('Error checking out: ', error);
                res.status(404).json({ message: error.message });
                return;
            }

            console.error('Error checking out: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
