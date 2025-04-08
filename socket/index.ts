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

export let io: SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    UserData
>;

export default (httpServer: HttpServer): SocketServer => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: ['http://localhost:3001'], // or "*" for public testing
        },
    });

    io.use(authenticate);

    setupAdminNamespace(io);

    io.on('connection', (socket) => {
        logger.log('Client connected:' + socket.id);
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
