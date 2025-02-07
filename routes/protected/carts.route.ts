import { Router } from 'express';
import { CartController } from '../../controllers/Cart.controller';
import { CartService } from '../../services';
import {
    validateCartItemDetails,
    validateId,
    validationErrors,
} from '../../middlewares/validation';

const router: Router = Router();
const cartController = new CartController(new CartService());

router.post(
    '/items',
    validateCartItemDetails(),
    validationErrors,
    cartController.addItemToCart.bind(cartController)
);

router.get('/items', cartController.getCartItems.bind(cartController));
router.get('/items/checkout', cartController.cartCheckout.bind(cartController));

router.patch(
    '/items/:id',
    validateId(),
    validationErrors,
    cartController.removeItemFromCart.bind(cartController)
); // Used patch due to common quantity subtraction updates

router.delete('/items', cartController.clearCart.bind(cartController));

export default router;
