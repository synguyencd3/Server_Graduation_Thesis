import { Router } from "express";
import accessoryController from "../controllers/accessory.c";
import middlewareController from "../middleware/middleware";

const router = Router();

router.get("/salon/:salonId", accessoryController.getAccessoryBySalonId);
router.get("/:id", accessoryController.getAccessoryById);
router.post(
  "/",
  middlewareController.verifyToken,
  accessoryController.createAccessory
);
router.patch("/:id", accessoryController.updateAccessory);
router.delete("/:id", accessoryController.deleteAccessory);

export default router;
