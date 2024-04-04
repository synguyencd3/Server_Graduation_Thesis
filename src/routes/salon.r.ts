import { Router } from 'express';
import salonController from '../controllers/salon.c';
import middlewareController from '../middleware/middleware';
import uploadCloud from "../middleware/uploader";

const router = Router();

router.get("/", salonController.getAllSalons);
router.get('/salonId', middlewareController.verifyToken, salonController.getSalonIdForUser);
router.get("/my-salon", middlewareController.verifyToken, salonController.getSalonByUserId);
router.get("/:id", salonController.getSalonById);
router.post("/", middlewareController.verifyToken, uploadCloud.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 5 },
  ]), salonController.createSalon);
router.patch("/:id", middlewareController.verifyToken, uploadCloud.fields([
  { name: "image", maxCount: 1 },
  { name: "banner", maxCount: 5 },
]), salonController.updateSalon);
router.delete("/:id", middlewareController.verifyToken, salonController.deleteSalon); 

router.post("/verifyInviteUser", middlewareController.verifyToken, salonController.verifyInviteFromNotification); 
router.post("/user", middlewareController.isAdminOfSalon, salonController.getEmployees);

// need to check user in salon.
router.post("/permission", middlewareController.isAdminOfSalon, middlewareController.isEmployeeOfSalon, salonController.handlePermission); 


export default router;