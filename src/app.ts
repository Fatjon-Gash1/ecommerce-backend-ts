import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import indexRoutes from '@/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@/swagger';
import { logger } from '@/logger';
import type { Request, Response } from 'express';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/', indexRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((error: Error, _req: Request, res: Response) => {
    logger.error('Unknown error: ' + error);
    res.status(500).json({ message: 'Internal server error' });
});

export default app;
