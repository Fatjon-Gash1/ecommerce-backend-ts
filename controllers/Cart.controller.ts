import { Request, Response } from 'express';
import { CartService } from '@/services';
import { Logger } from '@/logger';
import {
    CartNotFoundError,
    CartItemNotFoundError,
    ProductNotFoundError,
} from '@/errors';
import { JwtPayload } from 'jsonwebtoken';

export class CartController {
    private cartService: CartService;
    private logger: Logger;

    constructor(cartService: CartService) {
        this.cartService = cartService;
        this.logger = new Logger();
    }

    public async addItemToCart(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const { productId, quantity } = req.body;

        try {
            const cartItem = await this.cartService.addItemToCart(
                userId,
                productId,
                quantity
            );
            return res.status(201).json({ cartItem });
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                this.logger.error('Error adding item to cart: ' + error);
                return res.status(404).json({ message: error.message });
            }
            if (error instanceof ProductNotFoundError) {
                this.logger.error('Error adding item to cart: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error adding item to cart: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getCartItems(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;

        try {
            const cartItems = await this.cartService.getCartItems(userId);
            return res.status(200).json({ cartItems });
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                this.logger.error('Error getting cart items: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error getting cart items: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async cartCheckout(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;

        try {
            const totalPrice = await this.cartService.cartCheckout(userId);
            return res.status(200).json({ totalPrice });
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                this.logger.error('Error checking out: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error checking out: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async removeItemFromCart(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const productId: number = Number(req.params.id);

        try {
            await this.cartService.removeItemFromCart(userId, productId);
            return res.sendStatus(204);
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                this.logger.error('Error removing item from cart: ' + error);
                return res.status(404).json({ message: error.message });
            }

            if (error instanceof CartItemNotFoundError) {
                this.logger.error('Error removing item from cart: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error removing item from cart: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async clearCart(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;

        try {
            await this.cartService.clearCart(userId);
            return res.sendStatus(204);
        } catch (error) {
            if (error instanceof CartNotFoundError) {
                this.logger.error('Error clearing cart: ' + error);
                return res.status(404).json({ message: error.message });
            }

            this.logger.error('Error clearing cart: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
