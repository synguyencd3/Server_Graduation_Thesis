import { Router } from 'express';
import salonController from '../controllers/salon.c';
import middlewareController from '../middleware/middleware';
import uploadCloud from "../middleware/uploader";

const router = Router();

router.get("/", salonController.getAllSalons);
router.get("/:id", salonController.getSalonById);
router.get("/my-salon", middlewareController.verifyToken, salonController.getSalonByUserId);
router.post("/", middlewareController.verifyToken, uploadCloud.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 5 },
  ]), salonController.createSalon);
router.patch("/:id", middlewareController.verifyToken, uploadCloud.fields([
  { name: "image", maxCount: 1 },
  { name: "banner", maxCount: 5 },
]), salonController.updateSalon);
router.delete("/:id", middlewareController.verifyToken, salonController.deleteSalon); 

export default router;