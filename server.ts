import 'module-alias/register';
import * as dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import express, { Express, Request, Response } from 'express';
import instantiateSocketServer from './socket';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { sequelize, connectToMongoDB, mongoose } from '@/config/db';
import indexRoutes from '@/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@/swagger';
import { redisClient } from '@/config/redis';
import EsClient from '@/config/elasticsearch';
import { transporter } from './config/transporter';
import { logger } from '@/logger';
import './queueWorkers';

const HOST = process.env.HOST;
const PORT = process.env.PORT || 3000;

const app: Express = express();
const httpServer = createServer(app);
const socketServer = instantiateSocketServer(httpServer);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

sequelize
    .sync()
    .then(() => {
        logger.log('Sequelize models synced with database');
    })
    .catch((err: Error) => {
        logger.error('Error syncing Sequelize models:' + err);
    });

connectToMongoDB();

app.use('/', indexRoutes);

app.use((error: Error, _req: Request, res: Response) => {
    logger.error('Unknown error: ' + error);
    res.status(500).json({ message: 'Internal server error' });
});

function gracefulShutdown() {
    logger.log('\nShutting down server...');

    Promise.all([
        redisClient.quit(),
        mongoose.connection.close(),
        sequelize.close(),
        EsClient.close(),
        transporter.close(),
        new Promise((resolve) => socketServer.close(resolve)),
    ])
        .then(() => {
            logger.log('All connections closed. Exiting...');
            process.exit(0);
        })
        .catch((err) => {
            logger.error('Error during shutdown:' + err);
            process.exit(1);
        });
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

httpServer.listen(PORT, () => {
    if (process.env.NODE_ENV === 'production') {
        logger.log(`Server is running on ${HOST}`);
    } else {
        logger.log(`Server is running on ${HOST}:${PORT}`);
    }
});
