import { Router, Request, Response } from 'express';
import {
    checkAvailability,
    getAdmins,
    getAdminByID,
    createAdmin,
    updateAdmin,
    deleteAdmin,
} from '../controllers/Admin.controller';
import validateUserFields from '../middlewares/validateUserFields';

const router: Router = Router();

// Additional admin routes
router.get('/check-availability', (req: Request, res: Response) =>
    checkAvailability(req, res)
);

// Define CRUD admin routes
router.get('/', (req: Request, res: Response) => getAdmins(req, res));

router.get('/:id', (req: Request, res: Response) => getAdminByID(req, res));

router.post('/', validateUserFields, (req: Request, res: Response) =>
    createAdmin(req, res)
);

router.put('/:id', validateUserFields, (req: Request, res: Response) =>
    updateAdmin(req, res)
);

router.delete('/:id', (req: Request, res: Response) => deleteAdmin(req, res));

export default router;
