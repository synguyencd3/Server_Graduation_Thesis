import { Router } from 'express';
import warrantyController from '../controllers/warranty.c';

const router = Router();

router.post("/create", warrantyController.createNewWarranty);
router.post("/", warrantyController.getWarrantyForSalon);
router.get("/car/:id", warrantyController.test);
router.post("/push-warranty", warrantyController.pushWarrantyCar);

export default router;
