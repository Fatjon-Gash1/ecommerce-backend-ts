import { Router } from 'express';
import { ProductController } from '../../../controllers/Product.controller';
import { ProductService, AdminLogsService } from '../../../services';
import {
    categoryCreationRateLimiter,
    productCreationRateLimiter,
    categoryUpdateRateLimiter,
    productUpdateRateLimiter,
    categoryDeletionRateLimiter,
    productDeletionRateLimiter,
} from '../../../middlewares/rateLimiting';
import {
    validateCategory,
    validateSubCategory,
    validateCategoryWithSubCategories,
    validateProduct,
    validateDiscount,
    validateProductUpdate,
    validateId,
    validationErrors,
} from '../../../middlewares/validation';

const router: Router = Router();
const productController = new ProductController(
    new ProductService(),
    new AdminLogsService()
);

router.post(
    '/categories',
    categoryCreationRateLimiter,
    validateCategory(),
    validationErrors,
    productController.addCategory.bind(productController)
);

router.post(
    '/categories/subcategories',
    categoryCreationRateLimiter,
    validateSubCategory(),
    validationErrors,
    productController.addSubCategory.bind(productController)
);

router.post(
    '/categories',
    categoryCreationRateLimiter,
    validateCategoryWithSubCategories(),
    validationErrors,
    productController.createCategoryWithSubCategories.bind(productController)
);

router.post(
    '/',
    productCreationRateLimiter,
    validateProduct(),
    validationErrors,
    productController.addProduct.bind(productController)
);

router.get(
    '/:id/category',
    validateId(),
    validationErrors,
    productController.getProductCategory.bind(productController)
);

router.get(
    '/in-stock',
    productController.getProductsInStock.bind(productController)
);

router.get(
    '/out-of-stock',
    productController.getProductsOutOfStock.bind(productController)
);

router.patch(
    '/categories/:id',
    categoryUpdateRateLimiter,
    validateId(),
    validationErrors,
    productController.updateCategoryById.bind(productController)
);

router.patch(
    '/categories/subcategories/:id',
    categoryUpdateRateLimiter,
    validateId(),
    validationErrors,
    productController.updateSubCategoryById.bind(productController)
);

router.patch(
    '/:id/discount',
    productUpdateRateLimiter,
    validateDiscount(),
    validationErrors,
    productController.setDiscountForProduct.bind(productController)
);

router.patch(
    '/',
    productUpdateRateLimiter,
    validateProductUpdate(),
    validationErrors,
    productController.updateProduct.bind(productController)
);

router.delete(
    '/categories/:id',
    categoryDeletionRateLimiter,
    validateId(),
    validationErrors,
    productController.deleteCategoryById.bind(productController)
);

router.delete(
    '/categories/subcategories/:id',
    categoryDeletionRateLimiter,
    validateId(),
    validationErrors,
    productController.deleteSubCategoryById.bind(productController)
);

router.delete(
    '/',
    productDeletionRateLimiter,
    validateId(),
    validationErrors,
    productController.deleteProductById.bind(productController)
);
export default router;
