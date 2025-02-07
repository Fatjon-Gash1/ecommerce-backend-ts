import { Router } from 'express';
import { ShippingController } from '../../controllers/Shipping.controller';
import { ShippingService } from '../../services';
import authorize from '../../middlewares/authorization/authorize';
import {
    validateShippingCostDetails,
    validateId,
    validationErrors,
} from '../../middlewares/validation';

const router: Router = Router();
const shippingController = new ShippingController(new ShippingService());

router.get(
    '/:countryId/cities',
    validateId('countryId'),
    validationErrors,
    shippingController.getShippingCitiesByCountryId.bind(shippingController)
);
router.get(
    '/weight',
    authorize(['customer']),
    shippingController.determineWeightRangeForCart.bind(shippingController)
);
router.get(
    '/cost',
    authorize(['customer']),
    validateShippingCostDetails(),
    validationErrors,
    shippingController.calculateShippingCost.bind(shippingController)
);
router.get(
    '/countries',
    shippingController.getShippingCountries.bind(shippingController)
);

export default router;
