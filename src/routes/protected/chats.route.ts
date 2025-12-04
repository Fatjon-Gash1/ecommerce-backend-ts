import { Router } from 'express';
import { ChattingServiceHTTP } from '@/services';
import { ChattingController } from '@/controllers/Chatting.controller';
import {
    validateId,
    validateType,
    validateMessageDate,
    validateRating,
    validationErrors,
} from '@/middlewares/validation';
import authorize from '@/middlewares/authorization/authorize';

const router: Router = Router();
const chattingController = new ChattingController(new ChattingServiceHTTP());

router.get(
    '/chatrooms',
    validateType(),
    validationErrors,
    chattingController.getUserChatroomsByType.bind(chattingController)
);
router.get(
    '/chatrooms/:id/messages',
    validateId(),
    validateMessageDate(),
    validationErrors,
    chattingController.getChatroomMessages.bind(chattingController)
);

router.patch(
    'support-chatroom/:id/rate',
    authorize(['customer']),
    validateId(),
    validateRating(),
    validationErrors,
    chattingController.rateSupportSession.bind(chattingController)
);

export default router;
