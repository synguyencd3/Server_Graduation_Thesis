import { Router } from 'express';
import packageController from '../controllers/package.c';
import uploadCloud from "../middleware/uploader";

const router = Router();

router.get("/", packageController.getAllPackages);
router.get("/:id", packageController.getPackageById);
router.post("/", uploadCloud.single("image"), packageController.createPackage);
router.patch("/:id", uploadCloud.single("image"), packageController.updatePackage);
router.delete("/:id", packageController.deletePackage);

export default router;