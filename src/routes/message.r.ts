import { Router } from 'express';
import messageController from '../controllers/message.c';
import middlewareController from '../middleware/middleware';

const router = Router();

router.get("/chatting-users", middlewareController.verifyToken, messageController.getChattingUsers);
router.get("/:id", middlewareController.verifyToken, messageController.getMessages);
router.post("/send/:id", middlewareController.verifyToken, messageController.sendMessage);

export default router;