import { Router } from 'express';
import adminController from '../controllers/admin.c';
import middleware from '../middleware/middleware';

const router = Router();

router.post("/update-permission", middleware.verifyToken, middleware.isAdminTeam, adminController.updatePermission);
router.post("/", middleware.verifyToken, middleware.havePermission("Z-PERMISSION-101"), adminController.getPermission);

// get logs
router.post("/logs", middleware.verifyToken, middleware.havePermission("Z-PERMISSION-101"), adminController.getLogs);

// get all database =>  only dev
router.post("/db", middleware.verifyToken, middleware.isAdminTeam, adminController.getDB);


export default router;
