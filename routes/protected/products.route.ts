import { Router } from 'express';
import { ProductController } from '@/controllers/Product.controller';
import { ProductService } from '@/services';
import {
    validateId,
    validateQuery,
    validationErrors,
} from '@/middlewares/validation';

const router: Router = Router();
const productController = new ProductController(new ProductService());

router.get(
    '/categories/:id',
    validateId(),
    validationErrors,
    productController.getProductsByCategoryWithExclusiveness.bind(productController)
);
router.get(
    '/view/:id',
    validateId(),
    validationErrors,
    productController.viewProductByIdWithExclusiveness.bind(productController)
);
router.get(
    '/search',
    validateQuery(),
    validationErrors,
    productController.searchProducts.bind(productController)
);
router.get('/', productController.getAllProductsWithExclusiveness.bind(productController));

export default router;
