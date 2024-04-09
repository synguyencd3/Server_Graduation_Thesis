import { Router } from 'express';
import adminController from '../controllers/admin.c';
import middleware from '../middleware/middleware';

const router = Router();

router.post("/update-permission", middleware.verifyToken, middleware.isAdminTeam, adminController.updatePermission);
router.post("/", middleware.verifyToken, middleware.havePermission("Z-PERMISSION-101"), adminController.getPermission);

export default router;
