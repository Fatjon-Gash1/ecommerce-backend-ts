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
    productController.getProductsByCategory.bind(productController)
);
router.get(
    '/view/:id',
    validateId(),
    validationErrors,
    productController.viewProductById.bind(productController)
);
router.get(
    '/:id/discounted',
    validateId(),
    validationErrors,
    productController.getDiscountedPrice.bind(productController)
);
router.get(
    '/categories/top-level',
    productController.getAllTopLevelCategories.bind(productController)
);
router.get(
    '/categories',
    productController.getAllCategories.bind(productController)
);
router.get(
    '/category/:id/subcategories',
    validateId(),
    validationErrors,
    productController.getSubCategoriesForCategory.bind(productController)
);
router.get(
    '/search',
    validateQuery(),
    validationErrors,
    productController.searchProducts.bind(productController)
);
router.get('/', productController.getAllProducts.bind(productController));

export default router;
