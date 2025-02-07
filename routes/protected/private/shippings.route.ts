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
    validationErrors,
    validateShippingCountryUpdate,
    validateShippingCityUpdate,
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
    '/countries/:id/cities',
    validateId(),
    validateShippingCity(),
    validationErrors,
    shippingController.addCityToCountry.bind(shippingController)
);

router.patch(
    '/countries/:id',
    shippingUpdateRateLimiter,
    validateId(),
    validateShippingCountryUpdate(),
    validationErrors,
    shippingController.updateShippingCountry.bind(shippingController)
);
router.patch(
    '/countries/cities/:id',
    shippingUpdateRateLimiter,
    validateId(),
    validateShippingCityUpdate(),
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

router.put(
    '/countries/:id',
    shippingUpdateRateLimiter,
    validateId(),
    validateShippingCountry(),
    validationErrors,
    shippingController.updateShippingCountry.bind(shippingController)
);
router.put(
    '/countries/cities/:id',
    shippingUpdateRateLimiter,
    validateId(),
    validateShippingCity(),
    validationErrors,
    shippingController.updateShippingCity.bind(shippingController)
);

router.delete(
    '/countries/:id',
    validateId(),
    validationErrors,
    shippingController.deleteShippingCountry.bind(shippingController)
);
router.delete(
    '/countries/cities/:id',
    validateId(),
    validationErrors,
    shippingController.deleteShippingCity.bind(shippingController)
);

export default router;
