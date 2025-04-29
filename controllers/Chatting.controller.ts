import { Request, Response } from 'express';
import { ChattingServiceHTTP } from '@/services';
import { Logger } from '@/logger';
import { JwtPayload } from 'jsonwebtoken';

export class ChattingController {
    private chattingService: ChattingServiceHTTP;
    private logger: Logger;

    constructor(chattingService: ChattingServiceHTTP) {
        this.chattingService = chattingService;
        this.logger = new Logger();
    }

    public async getUserChatroomsByType(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const type = req.query.type;

        try {
            const { chatrooms, total } =
                await this.chattingService.getUserChatroomsByType(
                    userId,
                    type?.toString()
                );

            res.status(200).json({ chatrooms, total });
        } catch (error) {
            this.logger.error('Error retrieving user chatrooms: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async getChatroomMessages(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const { userId } = req.user as JwtPayload;
        const chatroomId = Number(req.params.id);
        const { ['last-message-date']: lastMessageDate } = req.query;

        try {
            const messages = await this.chattingService.getChatroomMessages(
                userId,
                chatroomId,
                lastMessageDate
                    ? new Date(lastMessageDate.toString())
                    : undefined
            );

            res.status(200).json({ messages });
        } catch (error) {
            this.logger.error('Error retrieving chatroom messages: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public async rateSupportSession(
        req: Request,
        res: Response
    ): Promise<void | Response> {
        const chatroomId = Number(req.params.id);
        const { rating } = req.body;

        try {
            await this.chattingService.rateSupportSession(chatroomId, rating);
            return res.sendStatus(204);
        } catch (error) {
            this.logger.error('Error rating support session: ' + error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
