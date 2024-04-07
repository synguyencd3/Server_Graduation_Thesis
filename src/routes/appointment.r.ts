import { Router } from 'express';
import appointmentController from '../controllers/appointment.c';
import middleware from '../middleware/middleware';

const router = Router();

router.post("/get-appoint-admin", middleware.verifyToken, middleware.havePermission("R_APM"), appointmentController.get);
router.patch("/update-one-admin", middleware.verifyToken, middleware.havePermission("U_APM"),appointmentController.updateOne);
router.delete("/delete-appoint-admin", middleware.verifyToken, middleware.havePermission("D_APM"),appointmentController.delete);

router.post("/create-appointment", middleware.verifyToken, appointmentController.createAppointment);
router.post("/get-appoint-user", middleware.verifyToken, appointmentController.get);
router.patch("/update-one-user", middleware.verifyToken, appointmentController.updateOne);
router.delete("/delete-appoint-user", middleware.verifyToken, appointmentController.delete);

export default router;
