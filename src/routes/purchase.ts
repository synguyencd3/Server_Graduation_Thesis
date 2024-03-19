import { Router } from 'express';
import userPurchaseController from '../controllers/purchase';
import middlewareController from '../middleware/middleware';

const router = Router();

router.get("/", middlewareController.verifyToken, userPurchaseController.getAllPurchasePackages);
router.post("/", middlewareController.verifyToken, userPurchaseController.createPurchasePackage);

export default router;