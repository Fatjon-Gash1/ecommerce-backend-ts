import { Router, Request, Response } from 'express';
import { ReplenishmentService } from '../../services';

const router: Router = Router();
const service = new ReplenishmentService();
service.listenAll();

router.post(
    '/schedules',
    async (req: Request, res: Response): Promise<Response | void> => {
        // userId must be retrieved from the access token.
        const { data, interval, unit, trial, expiry, times } = req.body;

        try {
            await service.scheduler.scheduleReplenishment(
                data,
                interval,
                unit,
                trial,
                expiry,
                times
            );

            return res
                .status(200)
                .json({ message: 'Scheduled recurring payment' });
        } catch (error) {
            console.error('Error scheduling recurring payment: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;
