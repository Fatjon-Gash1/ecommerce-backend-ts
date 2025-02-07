import { Router, Request, Response } from 'express';
import { ReplenishmentService } from '../../services';
import { UserNotFoundError } from '../../errors';

const router: Router = Router();
const service = new ReplenishmentService();
service.listenAll();

router.post(
    '/schedules',
    async (req: Request, res: Response): Promise<Response | void> => {
        // userId must be retrieved from the access token.
        const { data, interval, unit, starting, expiry, times } = req.body;

        try {
            await service.scheduler.createReplenishment(
                data,
                interval,
                unit,
                starting,
                expiry,
                times
            );

            return res
                .status(201)
                .json({ message: 'Created replenishment schedule' });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                console.error('Error creating replenishment schedule: ', error);
                return res.status(404).json({ message: error.message });
            }
            console.error('Error creating replenishment schedule: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
);

router.get('/schedules/:id', async (req: Request, res: Response) => {
    const userId: number = Number(req.query.userId);
    const replenishmentId: number = Number(req.params.id);

    try {
        const replenishment = await service.scheduler.getReplenishmentById(
            userId,
            replenishmentId
        );
        return res.status(200).json({ replenishment });
    } catch (error) {
        console.error('Error retrieving customer replenishment: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/schedules', async (req: Request, res: Response) => {
    const userId: number = Number(req.query.userId);

    try {
        const { total, rows } =
            await service.scheduler.getCustomerReplenishments(userId);
        return res.status(200).json({ total, replenishments: rows });
    } catch (error) {
        console.error('Error retrieving customer replenishments: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.put(
    '/schedules/:id',
    async (req: Request, res: Response): Promise<Response | void> => {
        // userId must be retrieved from the access token.
        const replenishmentId: number = Number(req.params.id);
        const { data, interval, unit, starting, expiry, times } = req.body;

        try {
            await service.scheduler.updateReplenishment(
                replenishmentId,
                data,
                interval,
                unit,
                starting,
                expiry,
                times
            );

            return res
                .status(200)
                .json({ message: 'Updated replenishment schedule' });
        } catch (error) {
            console.error('Error updating replenishment schedule: ', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
);
router.put('/schedules/:id/cancel', async (req: Request, res: Response) => {
    const userId: number = Number(req.query.userId);
    const replenishmentId: number = Number(req.params.id);

    try {
        await service.scheduler.toggleCancelStatusOnReplenishment(
            userId,
            replenishmentId
        );
        return res.sendStatus(204);
    } catch (error) {
        console.error('Error canceling replenishment: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/schedules/:id', async (req: Request, res: Response) => {
    const replenishmentId: number = Number(req.params.id);

    try {
        await service.scheduler.removeReplenishment(replenishmentId);
        return res.sendStatus(204);
    } catch (error) {
        console.error('Error removing replenishment schedule: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

export default router;
