import { logger } from '@/logger';
import type { Socket, ExtendedError } from 'socket.io';
import {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    UserData,
} from '@/types';

export default (
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        UserData
    >,
    next: (err?: ExtendedError) => void
): void => {
    const role = socket.data.type;

    if (role === 'admin' || role === 'manager') {
        next();
    } else {
        logger.log('Cannot connect to admin socket. Permission denied');
        next(new Error('Cannot connect to admin socket. Permission denied'));
    }
};
