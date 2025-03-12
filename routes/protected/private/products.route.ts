import { Router } from 'express';
import { ProductController } from '@/controllers/Product.controller';
import {
    ProductService,
    AdminLogsService,
    NotificationService,
} from '@/services';
import {
    categoryCreationRateLimiter,
    productCreationRateLimiter,
    categoryUpdateRateLimiter,
    productUpdateRateLimiter,
    categoryDeletionRateLimiter,
    productDeletionRateLimiter,
} from '@/middlewares/rateLimiting';
import {
    validateCategory,
    validateProduct,
    validateStockStatus,
    validateDiscount,
    validateCategoryUpdate,
    validateProductUpdate,
    validateId,
    validationErrors,
} from '@/middlewares/validation';
import { checkExact } from 'express-validator';

const router: Router = Router();
const productController = new ProductController(
    new ProductService(new NotificationService()),
    new AdminLogsService()
);

router.post(
    '/categories',
    categoryCreationRateLimiter,
    validateCategory(),
    checkExact([]),
    validationErrors,
    productController.addCategory.bind(productController)
);
router.post(
    '/categories/:id/products',
    productCreationRateLimiter,
    validateId(),
    validateProduct(),
    checkExact([]),
    validationErrors,
    productController.addProductByCategoryId.bind(productController)
);

router.get(
    '/:productId/category',
    validateId('productId'),
    validationErrors,
    productController.getProductCategory.bind(productController)
);
router.get(
    '/stock',
    validateStockStatus(),
    validationErrors,
    productController.getProductsByStockStatus.bind(productController)
);

router.patch(
    '/categories/:id',
    categoryUpdateRateLimiter,
    validateId(),
    validateCategoryUpdate(),
    validationErrors,
    productController.updateCategoryById.bind(productController)
);
router.patch(
    '/:productId/discount',
    productUpdateRateLimiter,
    validateId('productId'),
    validateDiscount(),
    validationErrors,
    productController.setDiscountForProduct.bind(productController)
);
router.patch(
    '/:id',
    productUpdateRateLimiter,
    validateId(),
    validateProductUpdate(),
    checkExact([]),
    validationErrors,
    productController.updateProductById.bind(productController)
);

router.delete(
    '/categories/:id',
    categoryDeletionRateLimiter,
    validateId(),
    validationErrors,
    productController.deleteCategoryById.bind(productController)
);
router.delete(
    '/:id',
    productDeletionRateLimiter,
    validateId(),
    validationErrors,
    productController.deleteProductById.bind(productController)
);

export default router;
