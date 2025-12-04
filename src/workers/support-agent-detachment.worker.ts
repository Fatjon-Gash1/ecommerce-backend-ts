import type IORedis from 'ioredis';
import { type Job, Worker } from 'bullmq';
import { LoggingService } from '@/services';
import { logger } from '@/logger';
import { SupportAgent } from '@/models/relational';

const QUEUE_NAME = 'supportAgentDetachmentJobQueue';

export default class SupportAgentDetachmentWorker {
    private loggingService: LoggingService;
    private worker: Worker;

    constructor(
        loggingService: LoggingService,
        connection: IORedis,
        concurrency: number = 50
    ) {
        this.loggingService = loggingService;
        this.worker = new Worker(
            QUEUE_NAME,
            async (job: Job) => this.processor(job),
            {
                concurrency,
                connection,
            }
        );
    }

    private async processor(job: Job) {
        try {
            const agent = await SupportAgent.findOne({
                where: { userId: job.data.agentUserId },
            });
            if (!agent) {
                throw new Error('Support agent not found');
            }
            agent.status = 'available';
            await agent.save();
            return agent.id;
        } catch (error) {
            logger.error('Error from worker5: ' + error);
            throw new Error(
                '"supportAgentDetachmentJobQueue" worker couldn\'t process it.'
            );
        }
    }

    public listen(): void {
        this.worker.on('completed', async (_job: Job, agentId: number) => {
            await this.loggingService.log(
                'Support Agent Detachment',
                `Support Agent "${agentId}" is now available`
            );
        });

        this.worker.on('failed', (job, err) => {
            if (!job) {
                return logger.error('Failed job not found!');
            }

            logger.error(
                `Job with id "${job.id}" has failed because ${err.message}`
            );

            logger.log('Retry attempt: ' + job.attemptsMade);
        });

        this.worker.on('error', (err) => {
            logger.error(`Error from ${QUEUE_NAME} worker: ${err}`);
        });
    }
}
