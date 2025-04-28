import { Server as SocketServer } from 'socket.io';
import authenticate from '@/middlewares/authentication/socketAccessToken';
import setupAdminNamespace from './admin';
import { logger } from '@/logger';
import type { Server as HttpServer } from 'http';
import {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    UserData,
} from '@/types';
import { ChattingService, LoggingService } from '@/services';

export let io: SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    UserData
>;

const clientUrl = process.env.CLIENT_URL;

export default (httpServer: HttpServer): SocketServer => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: clientUrl,
        },
    });

    io.use(authenticate);

    setupAdminNamespace(io);

    const chattingService = new ChattingService(io, new LoggingService());

    io.on('connection', async (socket) => {
        logger.log('Client connected:' + socket.id);

        await chattingService.init(socket);

        const { userId, type } = socket.data;
        socket.join(`notifications:${userId}`);
        if (type === 'customer') {
            socket.join(`orders:${userId}`);
        }

        socket.on('disconnect', () => {
            logger.log('Client disconnected:' + socket.id);
        });
    });

    return io;
};
