import { Router } from 'express';
import { ShippingController } from '../../../controllers/Shipping.controller';
import { ShippingService, AdminLogsService } from '../../../services';
import { shippingUpdateRateLimiter } from '../../../middlewares/rateLimiting';
import {
    validateShippingCountry,
    validateShippingCity,
    validateShippingMethodRate,
    validateShippingWeightRate,
    validateId,
    validateCountryId,
    validationErrors,
} from '../../../middlewares/validation';

const router: Router = Router();
const shippingController = new ShippingController(
    new ShippingService(),
    new AdminLogsService()
);

router.post(
    '/countries',
    validateShippingCountry(),
    validationErrors,
    shippingController.addShippingCountry.bind(shippingController)
);
router.post(
    '/countries/:countryId/cities',
    validateCountryId(),
    validateShippingCity(),
    validationErrors,
    shippingController.addCityToCountry.bind(shippingController)
);

router.patch(
    '/countries/:countryId',
    shippingUpdateRateLimiter,
    validateCountryId(),
    validateShippingCountry(),
    validationErrors,
    shippingController.updateShippingCountry.bind(shippingController)
);
router.patch(
    '/countries/:countryId/cities/:id',
    shippingUpdateRateLimiter,
    validateCountryId(),
    validateId(),
    validateShippingCity(),
    validationErrors,
    shippingController.updateShippingCity.bind(shippingController)
);
router.patch(
    '/method-rate',
    shippingUpdateRateLimiter,
    validateShippingMethodRate(),
    validationErrors,
    shippingController.changeShippingMethodRate.bind(shippingController)
);
router.patch(
    '/weight-rate',
    shippingUpdateRateLimiter,
    validateShippingWeightRate(),
    validationErrors,
    shippingController.changeShippingWeightRate.bind(shippingController)
);

router.delete(
    '/countries/:countryId',
    validateCountryId(),
    validationErrors,
    shippingController.deleteShippingCountry.bind(shippingController)
);
router.delete(
    '/countries/:countryId/cities/:id',
    validateCountryId(),
    validateId(),
    validationErrors,
    shippingController.deleteShippingCity.bind(shippingController)
);

export default router;
