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
    '/cities/:id',
    validateId(),
    validationErrors,
    shippingController.getShippingCitiesByCountryId.bind(shippingController)
);
router.get(
    '/weight/:id',
    authorize(['customer']),
    validateId(),
    validationErrors,
    shippingController.determineWeightRangeByCartId.bind(shippingController)
);
router.get(
    '/cost/:id',
    authorize(['customer']),
    validateId(),
    validateShippingCostDetails(),
    validationErrors,
    shippingController.calculateShippingCost.bind(shippingController)
);
router.get(
    '/countries',
    shippingController.getShippingCountries.bind(shippingController)
);

export default router;
