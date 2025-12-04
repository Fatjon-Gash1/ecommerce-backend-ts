const redisMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
    zcard: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    zadd: jest.fn(),
    hexists: jest.fn(),
};

export const connectToRedisServer = jest.fn().mockReturnValue(redisMock);
export const redisClient = redisMock;
export const workerRedisClient = redisMock;
