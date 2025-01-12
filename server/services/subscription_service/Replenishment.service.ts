import { Scheduler } from './Scheduler';
import { WorkerService } from './Worker.service';

const queueName = process.env.SUBSCRIPTION_QUEUE_NAME || 'payments-queue';

// Might move this to the subscription service
export class ReplenishmentService {
    public scheduler: Scheduler;
    private workerService: WorkerService;

    constructor() {
        this.scheduler = new Scheduler(queueName);
        this.workerService = new WorkerService(queueName);
    }

    public listenAll(): void {
        this.scheduler.listen();
        this.workerService.listen();
    }
}
