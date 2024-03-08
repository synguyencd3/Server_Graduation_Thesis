import { Router } from 'express';
import featureController from '../controllers/feature.c';

const router = Router();

router.get("/", featureController.getAllFeatures);
router.get("/:id", featureController.getFeatureById);
router.post("/", featureController.createFeature);
router.patch("/:id", featureController.updateFeature);
router.delete("/:id", featureController.deleteFeature);

export default router;