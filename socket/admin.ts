import { logger } from '@/logger';
import authenticate from '@/middlewares/authentication/socketAccessToken';
import authorize from '@/middlewares/authorization/socketAuthorize';
import type { Server, Namespace } from 'socket.io';
import {
    ClientToServerEvents,
    AdminServerToClientEvents,
    InterServerEvents,
    UserData,
} from '@/types';

export let adminNamespace: Namespace<
    ClientToServerEvents,
    AdminServerToClientEvents,
    InterServerEvents,
    UserData
>;

export default (io: Server) => {
    adminNamespace = io.of('/admins');

    adminNamespace.use(authenticate);

    adminNamespace.use(authorize);

    adminNamespace.on('connection', (socket) => {
        logger.log('Admin connected:' + socket.id);

        socket.on('disconnect', () => {
            logger.log('Admin disconnected:' + socket.id);
        });
    });
};

//customer related emits for order operations
//
// server side
// io.to('orders:${userId}').emit(`order:${trackingNumber}`, geoJSONData);
//
// client side
// io.on(`order:${trackingNumber}`, (geoJSONData) => {}
//
// admin related emits
//
// fleet data
// adminNamespace.emit('orders', geoJSONData);
//
// user orders data
// adminNamespace.emit(`orders:${userId}`, geoJSONData);
//
//user order data
// adminNamespace.emit(`order:${trackingNumber}`, geoJSONData);
