import { Router } from 'express';
import { AnalyticsController } from '../../../controllers/Analytics.controller';
import { AnalyticsService, AdminLogsService } from '../../../services';
import {
    validatePurchaseFilter,
    validatePagination,
    validateProductStatus,
    validateOrderStatus,
    validateReportName,
    validateReportType,
    validateId,
    validationErrors,
} from '../../../middlewares/validation';

const router: Router = Router();
const analyticsController = new AnalyticsController(
    new AnalyticsService(),
    new AdminLogsService()
);

router.post(
    '/reports/sales',
    analyticsController.generateSalesReport.bind(analyticsController)
);
router.post(
    '/reports/stock',
    analyticsController.generateStockReport.bind(analyticsController)
);

router.get(
    '/products/purchases',
    validatePurchaseFilter(),
    validationErrors,
    analyticsController.getTotalProductPurchases.bind(analyticsController)
);
router.get(
    '/products/revenue',
    analyticsController.getTotalProductsRevenue.bind(analyticsController)
);
router.get(
    '/revenue',
    analyticsController.getTotalRevenue.bind(analyticsController)
);
router.get(
    '/orders/average-value',
    analyticsController.getAverageOrderValue.bind(analyticsController)
);
router.get(
    '/categories/most-purchases',
    analyticsController.getCategoryWithMostPurchases.bind(analyticsController)
);
router.get(
    '/customers/:id/products/purchases',
    validateId(),
    validationErrors,
    analyticsController.getTotalProductPurchasesForCustomer.bind(
        analyticsController
    )
);
router.get(
    '/customers/:id/categories/most-purchases',
    validateId(),
    validationErrors,
    analyticsController.getCategoryWithMostPurchasesByCustomer.bind(
        analyticsController
    )
);
router.get(
    '/products/top-selling',
    validatePagination(),
    validationErrors,
    analyticsController.getTopSellingProducts.bind(analyticsController)
);
router.get(
    '/products/views',
    analyticsController.getProductViews.bind(analyticsController)
);
/*router.get(
    '/categories/purchases',
    analyticsController.getCategoryPurchases.bind(analyticsController)
);*/
router.get(
    '/products',
    validateProductStatus(),
    validationErrors,
    analyticsController.getProductsByStockStatus.bind(analyticsController)
);
router.get(
    '/categories/stock',
    validateProductStatus(),
    validationErrors,
    analyticsController.getStockDataForCategoryByStatus.bind(
        analyticsController
    )
);
router.get(
    '/orders',
    validateOrderStatus(),
    validationErrors,
    analyticsController.getPlatformOrdersByStatus.bind(analyticsController)
);

router.delete(
    'reports',
    validateReportName(),
    validationErrors,
    analyticsController.deleteReport.bind(analyticsController)
);
router.delete(
    '/reports',
    validateReportType(),
    validationErrors,
    analyticsController.deleteAllReportsByType.bind(analyticsController)
);

export default router;
