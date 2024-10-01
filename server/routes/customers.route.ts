import { Router, Request, Response } from 'express';
import { getCustomers } from '../controllers/Customer.controller';
import validateUserFields from '../middlewares/validateUserFields';

const router: Router = Router();

// Additional customer routes
/*router.get('/check-availability', (req: Request, res: Response) =>
    checkAvailability(req, res)
);*/

// Define CRUD customer routes
router.get('/', (req: Request, res: Response) => getCustomers(req, res));

/*router.get('/:id', (req: Request, res: Response) => getCustomerByID(req, res));

router.post('/', validateUserFields, (req: Request, res: Response) =>
    createCustomer(req, res)
);

router.put('/:id', validateUserFields, (req: Request, res: Response) =>
    updateCustomer(req, res)
);

router.delete('/:id', (req: Request, res: Response) =>
    deleteCustomer(req, res)
);*/

export default router;
