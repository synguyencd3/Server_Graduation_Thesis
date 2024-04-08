import { Router } from 'express';
import adminController from '../controllers/admin.c';
import middleware from '../middleware/middleware';

const router = Router();

// router.post("/", middleware.verifyToken, middleware.havePermission("OWNER"), adminController.getPermission);
router.post("/", adminController.getPermission);

export default router;
