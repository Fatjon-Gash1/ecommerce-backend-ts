import { Router } from 'express';
import { AnalyticsController } from '@/controllers/Analytics.controller';
import { AnalyticsService, LoggingService } from '@/services';
import {
    validatePagination,
    validateProductStatus,
    validateOrderStatus,
    validateReportName,
    validateReportType,
    validateId,
    validationErrors,
    validatePurchaseFilters,
} from '@/middlewares/validation';

const router: Router = Router();
const analyticsController = new AnalyticsController(
    new AnalyticsService(),
    new LoggingService()
);

router.post(
    '/reports/sales',
    analyticsController.generateSalesReport.bind(analyticsController)
);
//router.post(
//    '/reports/stock',
//    analyticsController.generateStockReport.bind(analyticsController)
//);

router.get(
    '/products/purchases',
    validatePurchaseFilters(),
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
    '/customers/top',
    analyticsController.getTopCustomers.bind(analyticsController)
);
router.get(
    '/customers/:id/orders/total',
    validateId(),
    validationErrors,
    analyticsController.getTotalOrdersForCustomer.bind(
        analyticsController
    )
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
//router.get(
//    '/products/top-selling',
//    validatePagination(),
//    validationErrors,
//    analyticsController.getTopSellingProducts.bind(analyticsController)
//);
//router.get(
//    '/products/views',
//    analyticsController.getProductViews.bind(analyticsController)
//);
router.get(
    '/categories/purchases',
    analyticsController.getPurchasesPerCategory.bind(analyticsController)
);
//router.get(
//    '/products',
//    validateProductStatus(),
//    validationErrors,
//    analyticsController.getProductsByStockStatus.bind(analyticsController)
//);
//router.get(
//    '/categories/stock',
//    validateProductStatus(),
//    validationErrors,
//    analyticsController.getStockDataForCategoryByStatus.bind(
//        analyticsController
//    )
//);
//router.get(
//    '/orders',
//    validateOrderStatus(),
//    validationErrors,
//    analyticsController.getPlatformOrdersByStatus.bind(analyticsController)
//);
//
//router.delete(
//    'reports',
//    validateReportName(),
//    validationErrors,
//    analyticsController.deleteReport.bind(analyticsController)
//);
//router.delete(
//    '/reports',
//    validateReportType(),
//    validationErrors,
//    analyticsController.deleteAllReportsByType.bind(analyticsController)
//);

export default router;
