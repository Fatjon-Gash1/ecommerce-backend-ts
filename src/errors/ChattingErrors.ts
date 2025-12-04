export class ChatroomNotFoundError extends Error {
    constructor(message: string = 'Chatroom not found') {
        super(message);
        this.name = 'ChatroomNotFoundError';
    }
}
