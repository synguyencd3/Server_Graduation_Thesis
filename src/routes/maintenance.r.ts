import { Router } from "express";
import maintenanceController from "../controllers/maintenance.c";
import middlewareController from "../middleware/middleware";

const router = Router();

router.get("/", maintenanceController.getAllMaintenances);
router.get("/:id", maintenanceController.getMaintenanceById);
router.get("/salon/:salonId", maintenanceController.getMaintenanceBySalonId);
router.post(
  "/",
  middlewareController.verifyToken,
  maintenanceController.createMaintenance
);
router.patch("/:id", maintenanceController.updateMaintenance);
router.delete("/:id", maintenanceController.deleteMaintenance);

export default router;
