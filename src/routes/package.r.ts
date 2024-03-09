import { Router } from 'express';
import packageController from '../controllers/package.c';

const router = Router();

router.get("/", packageController.getAllPackages);
router.get("/:id", packageController.getPackageById);
router.post("/", packageController.createPackage);
router.patch("/:id", packageController.updatePackage);
router.delete("/:id", packageController.deletePackage);

export default router;