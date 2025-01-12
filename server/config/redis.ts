/*import redis from 'redis';
import wss from './webSocket';
import websocket from 'ws';

(async () => {
    const subscriber = redis.createClient();

    await subscriber.connect();

    await subscriber.subscribe('order_shipment', (message: string) => {
        console.log(message);
    });
    await subscriber.subscribe('back_in_stock', (message: string) => {
        console.log(message);
    });
    await subscriber.subscribe('offers', (message: string) => {
        console.log(message);
    });

    subscriber.on('message', (channel, message) => {
        console.log(`Message received on channel ${channel}: ${message}`);

        wss.clients.forEach((client) => {
            if (client.readyState === websocket.OPEN) {
                client.send(message);
            }
        });
    });
})();*/
import IORedis from 'ioredis';
export const connectToRedisServer = (): IORedis => {
    try {
        return new IORedis();
    } catch (error) {
        console.error('Error connecting to Redis server: ', error);
        throw new Error('Failed to connect to Redis server');
    }
};
