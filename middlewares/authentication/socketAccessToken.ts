import jwt from 'jsonwebtoken';
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
    const { accessToken } = socket.handshake.auth;

    if (!accessToken) {
        console.log('Access token missing');
        return next(new Error('Access denied. Access token missing'));
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
        socket.data = decoded as UserData;
        console.log('passed the authentication middleware');
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
        console.log('expired token error');
            return next(new Error(`Token expired at: ${error.expiredAt}`));
        }
        if (error instanceof jwt.JsonWebTokenError) {
        console.log('jwt token error');
            return next(new Error('Permission denied'));
        }

        console.log('internal server error from token');
        return next(new Error('Internal server error'));
    }
};
