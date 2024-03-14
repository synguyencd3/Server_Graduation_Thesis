import { Router } from 'express';
import salonController from '../controllers/salon.c';
import uploadCloud from "../middleware/uploader";

const router = Router();

router.get("/", salonController.getAllSalons);
router.get("/:id", salonController.getSalonById);
router.post("/", uploadCloud.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 5 },
  ]), salonController.createSalon);
router.patch("/:id", uploadCloud.fields([
  { name: "image", maxCount: 1 },
  { name: "banner", maxCount: 5 },
]), salonController.updateSalon);
router.delete("/:id", salonController.deleteSalon); 

export default router;