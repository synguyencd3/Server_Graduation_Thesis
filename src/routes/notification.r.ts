import { Router } from 'express';
import notificationController from '../controllers/notification.c';
import middleware from '../middleware/middleware';

const router = Router();

// admin salon
router.post("/get-notification-admin", middleware.isAdminOfSalon, notificationController.get);
router.patch("/read-notification-admin", middleware.isAdminOfSalon, notificationController.update)
router.delete("/delete-notification-admin", middleware.isAdminOfSalon, notificationController.delete);

// user
router.post("/get-notification-user", middleware.verifyToken, notificationController.get);
router.patch("/read-notification-user", middleware.verifyToken, notificationController.update)
router.delete("/delete-notification-user", middleware.verifyToken, notificationController.delete);

export default router;
