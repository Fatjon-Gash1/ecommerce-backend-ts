import { logger } from '@/logger';
import jwt from 'jsonwebtoken';
import type { Socket, ExtendedError } from 'socket.io';
import {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    UserData,
} from '@/types';

const socketErrorMessage = 'Cannot connect to users socket. ';

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
        logger.log(socketErrorMessage + 'Access denied. Access token missing');
        return next(
            new Error(
                socketErrorMessage + 'Access denied. Access token missing'
            )
        );
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
        socket.data = decoded as UserData;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const expiredAtDate = error.expiredAt.toISOString().split('T')[0];
            logger.log(
                socketErrorMessage + `Token expired at: ${expiredAtDate}`
            );
            return next(
                new Error(
                    socketErrorMessage + `Token expired at: ${expiredAtDate}`
                )
            );
        }
        if (error instanceof jwt.JsonWebTokenError) {
            logger.log(socketErrorMessage + 'Permission denied');
            return next(new Error(socketErrorMessage + 'Permission denied'));
        }

        logger.log(socketErrorMessage + 'Internal server error');
        return next(new Error(socketErrorMessage + 'Internal server error'));
    }
};
