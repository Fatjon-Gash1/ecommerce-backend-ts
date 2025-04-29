import { redisClient } from '@/config/redis';
import {
    Chatroom,
    Message,
    SupportAgent,
    SupportTicket,
    User,
    UserChatroom,
} from '@/models/relational';
import { sequelize } from '@/config/db';
import { Op } from 'sequelize';
import { LoggingService } from './Logging.service';
import { queue5 } from '@/jobQueues';
import { UserNotFoundError } from '@/errors';
import type { Server, Socket } from 'socket.io';
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    UserData,
} from '@/types';

/**
 * Service responsible for Real-Time one-on-one and group chatting.
 */
export class ChattingService {
    private io: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        UserData
    >;
    private loggingService: LoggingService;

    constructor(server: Server, loggingService: LoggingService) {
        this.io = server;
        this.loggingService = loggingService;
    }

    /**
     * Initializes the socket connection and sets up the necessary event listeners.
     *
     * @param socket - The socket instance representing the connected user.
     */
    public async init(
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            UserData
        >
    ) {
        await redisClient.hset('userSockets', socket.data.userId, socket.id);

        const userGroups = await redisClient.smembers(
            `${socket.data.userId}:groups`
        );

        for (const group of userGroups) {
            socket.join(group);
        }

        socket.on('createGroup', async (creatorUserId, ...memberUserIds) => {
            const chatroom = await this.createGroup(
                creatorUserId,
                ...memberUserIds
            );

            const groupName = `groupChat:${chatroom.id}`;

            socket.join(groupName);

            const pipeline = redisClient.pipeline();

            pipeline.sadd(`${creatorUserId}:groups`, groupName);

            for (const userId of memberUserIds) {
                pipeline.sadd(`${userId}:groups`, groupName);
            }

            await pipeline.exec();

            memberUserIds.forEach((userId) => {
                pipeline.hget('userSockets', userId.toString());
            });

            const results = await pipeline.exec();

            if (!results) {
                throw new Error('Error fetching socket Ids. Results null');
            }

            const socketIds = results.map(([error, result]) => {
                if (error) {
                    console.log('Error fetching socket Ids:', error);
                    throw new Error('Error fetching socket Ids');
                }
                return result as string;
            });

            socketIds.map((id) =>
                this.io.to(id).emit('groupJoin', chatroom.messages, groupName)
            );
        });

        socket.on('joinUserToGroup', (roomId) => {
            socket.join(roomId);
        });

        socket.on('groupMessage', async (message, senderUserId, roomId) => {
            socket
                .to(roomId)
                .emit('groupMessage', message, senderUserId, roomId);

            await Message.create({
                chatroomId: parseInt(roomId.split(':')[1]),
                senderId: senderUserId,
                message,
            });
        });

        socket.on(
            'addMemberToGroup',
            async (ownerUserId, groupName, memberUserId) => {
                const [groupAdmin, member] = await Promise.all([
                    User.findByPk(ownerUserId, { attributes: ['username'] }),
                    User.findByPk(memberUserId, { attributes: ['username'] }),
                ]);

                if (!groupAdmin || !member) {
                    throw new UserNotFoundError();
                }

                await redisClient.sadd(`${memberUserId}:groups`, groupName);
                const memberSocketId = await redisClient.hget(
                    'userSockets',
                    memberUserId.toString()
                );

                if (!memberSocketId) {
                    throw new Error('Member socket Id not found');
                }

                await UserChatroom.create({
                    userId: memberUserId,
                    chatroomId: parseInt(groupName.split(':')[1]),
                });

                const message = `${groupAdmin.username} has added ${member.username} to the group`;

                await Message.create({
                    chatroomId: parseInt(groupName.split(':')[1]),
                    message,
                    systemMessage: true,
                });

                this.io.to(groupName).emit('addedGroupMember', message);

                this.io
                    .to(memberSocketId)
                    .emit(
                        'groupJoin',
                        [`${groupAdmin.username} has added you to the group`],
                        groupName
                    ); // client backfires with 'joinUserToGroup' event
            }
        );

        socket.on('groupLeave', async (userId, roomId, kicked?) => {
            socket.leave(roomId);

            await redisClient.srem(`${userId}:groups`, roomId);

            const user = await User.findByPk(userId, {
                attributes: ['username'],
            });
            if (!user) {
                throw new UserNotFoundError();
            }

            if (kicked) {
                const message = `Admin removed ${user.username} from the group`;
                this.io.to(roomId).emit('groupSystemMessage', message);
                return;
            }

            const message = `${user.username} has left the group`;

            this.io.to(roomId).emit('groupSystemMessage', message);

            await Message.create({
                chatroomId: parseInt(roomId.split(':')[1]),
                message,
                systemMessage: true,
            });
        });

        socket.on(
            'kickGroupMember',
            async (ownerUserId, kickedUserId, roomId) => {
                const chatroom = await Chatroom.findByPk(
                    parseInt(roomId.split(':')[1])
                );
                if (!chatroom) {
                    throw new Error('Chatroom not found');
                }

                if (ownerUserId !== chatroom.groupAdmin) {
                    throw new Error('Not authorized');
                }

                const kickedSocketId = await redisClient.hget(
                    'userSockets',
                    kickedUserId.toString()
                );

                if (!kickedSocketId) {
                    throw new Error('Kicked user socket Id not found');
                }

                this.io
                    .to(kickedSocketId)
                    .emit(
                        'kickedFromGroup',
                        roomId,
                        'You have been kicked from the group'
                    );
                // client backfires with 'groupLeave' event
                //
                const [groupAdmin, member] = await Promise.all([
                    User.findByPk(ownerUserId, { attributes: ['username'] }),
                    User.findByPk(kickedUserId, { attributes: ['username'] }),
                ]);

                if (!groupAdmin || !member) {
                    throw new UserNotFoundError();
                }
                await Message.create({
                    chatroomId: parseInt(roomId.split(':')[1]),
                    message: `${groupAdmin.username} has kicked ${member.username} from the group`,
                    systemMessage: true,
                });
            }
        );

        socket.on(
            'deleteGroup',
            async (ownerUserId, groupName, ...memberUserIds) => {
                const pipeline = redisClient.pipeline();

                pipeline.srem(`${ownerUserId}:groups`, groupName);

                for (const userId of memberUserIds) {
                    pipeline.srem(`${userId}:groups`, groupName);
                }

                await pipeline.exec();

                this.io.to(groupName).emit('groupDeleted', groupName);
                // backfire 'groupLeave'

                await Chatroom.destroy({
                    where: {
                        id: groupName.split(':')[1],
                        groupAdmin: ownerUserId,
                    },
                });
            }
        );

        socket.on(
            'message',
            async (
                senderUserId,
                message,
                targetUserId,
                chatroomId,
                support
            ) => {
                const targetSocketId = await redisClient.hget(
                    'userSockets',
                    targetUserId.toString()
                );
                if (!targetSocketId) {
                    throw new Error('Target user socket Id not found');
                }

                if (!chatroomId) {
                    const chatroomId = await this.createChatroom(
                        senderUserId,
                        targetUserId,
                        message
                    );
                    this.io.to(targetSocketId).emit('message', {
                        from: senderUserId,
                        message,
                        chatroomId,
                    });
                    return;
                }

                this.io.to(targetSocketId).emit('message', {
                    from: senderUserId,
                    message,
                    chatroomId,
                });

                await Message.create({
                    chatroomId,
                    senderId: senderUserId,
                    message,
                });

                if (socket.data.type === 'support') {
                    const firstResponse = await redisClient.hget(
                        'supportTicketTimestamps',
                        chatroomId.toString()
                    );

                    if (firstResponse) {
                        const passedMilliseconds =
                            Date.now() - parseInt(firstResponse);

                        const supportAgent = await SupportAgent.findOne({
                            where: { userId: senderUserId },
                            attributes: ['id'],
                        });

                        if (!supportAgent) {
                            throw new UserNotFoundError(
                                'Support agent not found'
                            );
                        }

                        await SupportTicket.create({
                            chatroomId,
                            agentId: supportAgent.id,
                            initialResponseTime: passedMilliseconds,
                        });
                        await redisClient.hdel(
                            'supportTicketTimestamps',
                            chatroomId.toString()
                        );
                    }

                    const pendingJob = await redisClient.hget(
                        'SupportAgentDetachmentJobs',
                        senderUserId.toString()
                    );

                    if (pendingJob) return;

                    const job = await queue5.add(
                        'detachSupportAgentJob',
                        { agentUserId: senderUserId },
                        { delay: 30000 }
                    );

                    if (job.id) {
                        await redisClient.hset(
                            'SupportAgentDetachmentJobs',
                            senderUserId,
                            job.id
                        );
                    }
                }

                if (support) {
                    const jobId = await redisClient.hget(
                        'SupportAgentDetachmentJobs',
                        targetUserId.toString()
                    );

                    if (!jobId) return;

                    await redisClient.hdel(
                        'SupportAgentDetachmentJobs',
                        targetUserId.toString()
                    );

                    const job = await queue5.getJob(jobId);

                    await job.remove();
                }
            }
        );

        socket.on(
            'viewMessage',
            async (
                viewerUserId,
                targetUserId,
                chatroomId,
                messageSenderId,
                oneOnOne
            ) => {
                await redisClient.sadd(
                    `lastMessage:${chatroomId}`,
                    viewerUserId
                );

                const viewers = await redisClient.smembers(
                    `lastMessage:${chatroomId}`
                );

                // Viewers are filtered on the client side

                if (oneOnOne) {
                    const socketId = await redisClient.hget(
                        'userSockets',
                        targetUserId.toString()
                    );
                    if (!socketId) {
                        throw new Error('Member socket Id not found');
                    }

                    this.io
                        .to(socketId)
                        .emit(
                            `lastMessageViews:${chatroomId}`,
                            viewers,
                            messageSenderId
                        );
                } else {
                    this.io
                        .to(`groupChat:${chatroomId}`)
                        .emit(
                            `lastMessageViews:${chatroomId}`,
                            viewers,
                            messageSenderId
                        );
                }
            }
        );

        socket.on(
            'updateMessage',
            async (messageId, newMessage, targetUserId, chatroomId) => {
                const message = await Message.findOne({
                    where: { id: messageId, senderId: socket.data.userId },
                });

                if (!message) {
                    throw new Error('Message not found');
                }

                if (targetUserId) {
                    const socketId = await redisClient.hget(
                        'userSockets',
                        targetUserId.toString()
                    );

                    if (!socketId) {
                        throw new Error('Target socket Id not found');
                    }

                    this.io
                        .to(socketId)
                        .emit('messageUpdated', messageId, newMessage);
                }

                if (chatroomId) {
                    this.io
                        .to('groupChat:' + chatroomId)
                        .emit('messageUpdated', messageId, newMessage);
                }

                message.message = newMessage;
                message.status = 'edited';
                await message.save();
            }
        );

        socket.on(
            'removeMessage',
            async (messageId, targetUserId, chatroomId) => {
                const message = await Message.findOne({
                    where: { id: messageId, senderId: socket.data.userId },
                });

                if (!message) {
                    throw new Error('Message not found');
                }

                if (targetUserId) {
                    const socketId = await redisClient.hget(
                        'userSockets',
                        targetUserId.toString()
                    );

                    if (!socketId) {
                        throw new Error('Target socket Id not found');
                    }

                    this.io.to(socketId).emit('messageRemoved', messageId);
                }

                if (chatroomId) {
                    this.io
                        .to('groupChat:' + chatroomId)
                        .emit('messageRemoved', messageId);
                }

                message.status = 'removed';
                await message.save();
            }
        );

        socket.on('updateGroupName', async (chatroomId, newName) => {
            const chatroom = await Chatroom.findByPk(chatroomId);

            if (!chatroom) {
                throw new Error('Chatroom not found');
            }

            if (socket.data.userId !== chatroom.groupAdmin) {
                throw new Error('Unauthorized');
            }

            this.io
                .to('groupChat:' + chatroomId)
                .emit('groupNameUpdated', chatroomId, newName);

            chatroom.name = newName;
            await chatroom.save();
        });

        socket.on(
            'contactSupport',
            async (senderUserType, senderUserId, message) => {
                if (senderUserType !== 'customer') {
                    throw new Error('Invalid user type. User must be customer');
                }

                const ticketTimestamp = Date.now();

                const supportAgents = await SupportAgent.findAll({
                    where: { status: 'available' },
                });

                const agent =
                    supportAgents[
                        Math.floor(Math.random() * supportAgents.length)
                    ];

                const socketId = await redisClient.hget(
                    'userSockets',
                    agent.userId.toString()
                );

                if (!socketId) {
                    throw new Error('Support agent socket Id not found');
                }

                agent.status = 'busy';
                await agent.save();

                const chatroomId = await this.createChatroom(
                    senderUserId,
                    agent.userId,
                    message
                );

                this.io.to(socketId).emit('message', {
                    from: senderUserId,
                    message,
                    chatroomId,
                });

                await this.loggingService.log(
                    'Support Agent Detachment',
                    `Support Agent "${agent.id}" is now available`
                );

                await redisClient.hset(
                    'supportTicketTimestamps',
                    chatroomId,
                    ticketTimestamp
                );
            }
        );

        socket.on(
            'markSupportTicketAsClosed',
            async (chatroomId, targetUserId, resolved) => {
                if (socket.data.type !== 'support') {
                    throw new Error(
                        'Invalid user type. User must be support agent'
                    );
                }

                const ticket = await SupportTicket.findOne({
                    where: { chatroomId },
                    include: {
                        model: SupportAgent,
                        as: 'agent',
                        where: { userId: socket.data.userId },
                        attributes: [],
                    },
                    attributes: ['status'],
                });

                if (!ticket) {
                    throw new Error(
                        'Cannot mark ticked as closed, no ticket was found'
                    );
                }
                const socketId = await redisClient.hget(
                    'userSockets',
                    targetUserId.toString()
                );

                if (!socketId) {
                    throw new Error('Target socket Id not found');
                }

                this.io.to(socketId).emit('ticketClosed', chatroomId, resolved);

                ticket.status = resolved ? 'resolved' : 'failed';

                await ticket.save();
            }
        );

        socket.on('detachSupportAgent', async (agentId) => {
            await SupportAgent.update(
                { status: 'available' },
                { where: { id: agentId } }
            );
            await this.loggingService.log(
                'Support Agent Detachment',
                `Support Agent "${agentId}" is now available`
            );
        });

        socket.on('groupTyping', (typerUserId, chatroomId) => {
            this.io
                .to(`groupChat:${chatroomId}`)
                .emit('groupTyping', typerUserId);
        });

        socket.on('groupTypingStopped', (typerUserId, chatroomId) => {
            this.io
                .to(`groupChat:${chatroomId}`)
                .emit('groupTypingStopped', typerUserId);
        });

        socket.on('typing', async (typerUserId, targetUserId) => {
            const socketId = await redisClient.hget(
                'userSockets',
                targetUserId.toString()
            );

            if (!socketId) {
                throw new Error('Socket Id not found for typing indication');
            }

            this.io.to(socketId).emit('typing', typerUserId);
        });

        socket.on('typingStopped', async (typerUserId, targetUserId) => {
            const socketId = await redisClient.hget(
                'userSockets',
                targetUserId.toString()
            );

            if (!socketId) {
                throw new Error('Socket Id not found for typing indication');
            }

            this.io.to(socketId).emit('typingStopped', typerUserId);
        });

        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            await redisClient.hdel(
                'userSockets',
                socket.data.userId.toString()
            );
        });
    }

    /**
     * Creates a group chatroom between two or more users and sends the first message.
     *
     * @param senderId - The ID of the user sending the message
     * @param targetUserIds - The IDs of the users receiving the message
     * @returns A promise that resolves to the ID of the created group chatroom and the initial messages
     */
    private async createGroup(
        senderId: number,
        ...targetUserIds: number[]
    ): Promise<{ messages: string[]; id: number }> {
        const transaction = await sequelize.transaction();

        try {
            const chatroom = await Chatroom.create({}, { transaction });

            const memberUsernames = (
                await Promise.allSettled(
                    targetUserIds.map(async (userId) => {
                        const user = await User.findByPk(userId, {
                            attributes: ['username'],
                        });

                        if (!user) {
                            throw new UserNotFoundError();
                        }

                        return user.username;
                    })
                )
            )
                .filter((data) => data.status === 'fulfilled')
                .map((data) => data.value);

            const bulkUsers = targetUserIds.map((userId) => {
                return { userId, chatroomId: chatroom.id };
            });

            await UserChatroom.bulkCreate([...bulkUsers], { transaction });

            const user = await User.findByPk(senderId, {
                attributes: ['username'],
            });

            if (!user) {
                throw new UserNotFoundError();
            }
            const createdMessages = await Message.bulkCreate(
                [
                    {
                        message: `User "${user.username}" has created a new group chat`,
                        chatroomId: chatroom.id,
                    },
                    {
                        message: `User "${user.username}" has added ${memberUsernames} to the group`,
                        chatroomId: chatroom.id,
                    },
                ],
                { transaction }
            );

            const serializedMessages = createdMessages.map(
                (message) => message.message
            );
            await transaction.commit();

            return {
                messages: serializedMessages,
                id: chatroom.id,
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Creates a chatroom between two users and sends the first message.
     *
     * @param senderUserId - The ID of the user sending the message
     * @param targetUserId - The ID of the user receiving the message
     * @param message - The content of the message
     * @returns A promise that resolves to the ID of the created chatroom
     */
    private async createChatroom(
        senderUserId: number,
        targetUserId: number,
        message: string
    ): Promise<number> {
        const transaction = await sequelize.transaction();

        try {
            const chatroom = await Chatroom.create(
                {
                    type: 'one-on-one',
                },
                { transaction }
            );

            await UserChatroom.bulkCreate(
                [
                    {
                        userId: senderUserId,
                        chatroomId: chatroom.id,
                    },
                    { userId: targetUserId, chatroomId: chatroom.id },
                ],
                { transaction }
            );
            await Message.create(
                {
                    chatroomId: chatroom.id,
                    senderId: senderUserId,
                    message,
                },
                { transaction }
            );
            await transaction.commit();

            return chatroom.id;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

/**
 * Serves chatting related business logic for HTTP requests.
 */
export class ChattingServiceHTTP {
    /**
     * Retrieves the user chatrooms by type, or all if type is not provided.
     *
     * @param userId - The ID of the user
     * @param [type] - The chatroom type ("one-on-one", "group", "support")
     * @returns A promise that resolves to an array of chatrooms
     */
    public async getUserChatroomsByType(
        userId: number,
        type?: string
    ): Promise<{ chatrooms: object[]; total: number }> {
        const { rows, count } = await Chatroom.findAndCountAll({
            where: { type },
            include: [
                { model: UserChatroom, where: { userId } },
                { model: Message, as: 'messages', limit: 1 },
            ],
        });

        const chatrooms = rows.map((row) => row.toJSON());

        return { chatrooms, total: count };
    }

    /**
     * Retrieved the chatroom messages.
     *
     * @param userId - The ID of the user
     * @param chatroomId - The ID of the chatroom
     * @param [lastMessageDate] - The timestamp of the last message
     * @returns A promise that resolves to an array of messages
     */
    public async getChatroomMessages(
        userId: number,
        chatroomId: number,
        lastMessageDate?: Date
    ): Promise<object[]> {
        const chatroom = await Chatroom.findOne({
            where: { id: chatroomId },
            attributes: [],
            include: [
                { model: UserChatroom, where: { userId }, attributes: [] },
                {
                    model: Message,
                    as: 'messages',
                    where: lastMessageDate
                        ? { createdAt: { [Op.lt]: lastMessageDate } }
                        : undefined,
                    limit: 100,
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: User,
                            as: 'sender',
                            attributes: ['id', 'username', 'profilePictureUrl'],
                        },
                    ],
                },
            ],
        });

        if (!chatroom) {
            throw new Error('Chatroom not found');
        }

        return chatroom.messages.map((message) => message.toJSON());
    }

    /**
     * Rates the support agent for the given session.
     *
     * @param chatroomId - The ID of the chatroom
     * @param rating - The rating value
     */
    public async rateSupportSession(
        chatroomId: number,
        rating: number
    ): Promise<void> {
        const ticket = await SupportTicket.findOne({ where: { chatroomId } });

        if (!ticket) {
            throw new Error('Cannot rate support session, no ticket was found');
        }

        if (ticket.status === 'pending') {
            throw new Error('Cannot rate support session, it is still pending');
        }

        ticket.customerRating = rating;

        await ticket.save();
    }
}
