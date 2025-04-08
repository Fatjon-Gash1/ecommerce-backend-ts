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
        console.log('passed the authorization middleware. IS ADMIN');
        next();
    } else {
        console.log('permission denied');
        next(new Error('Permission denied'));
    }
};
