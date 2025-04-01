import { redisClient } from './config/redis';
import { io } from './config/socket';
import { NotificationService } from './services';
import { logger } from '@/logger';

const notificationService = new NotificationService();

export const listenToSocketEvents = () => {
    io.on('connection', (socket) => {
        logger.log('User connected:' + socket.id);

        socket.on('connect', async (userId: number) => {
            await redisClient.hset('onlineUsers', userId, socket.id);
        });

        socket.on('disconnect', async () => {
            const onlineUsers = await redisClient.hgetall('onlineUsers');
            for (const key in onlineUsers) {
                if (onlineUsers[key] === socket.id) {
                    await redisClient.hdel('onlineUsers', key);
                    break;
                }
            }
            logger.log('User disconnected:' + socket.id);
        });

        socket.on(
            'readNotification',
            async (userId: number, notificationId: number) => {
                try {
                    await notificationService.markAsRead(
                        userId,
                        notificationId
                    );
                    logger.log('Notification marked as read');
                } catch (error) {
                    logger.error('Error marking notification as read:' + error);
                }
            }
        );
    });
};
