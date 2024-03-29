import { Router } from 'express';
import videocallController from '../controllers/videocall.c';
import middlewareController from '../middleware/middleware';

const router = Router();

router.get("/get-token", middlewareController.verifyToken, videocallController.getToken);
router.post("/create-meeting/", middlewareController.verifyToken, videocallController.createMeeting);
router.post("/validate-meeting/:meetingId", middlewareController.verifyToken, videocallController.validateMeeting);

export default router;