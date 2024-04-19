import { Router } from 'express';
import warrantyController from '../controllers/warranty.c';

const router = Router();

router.post("/create", warrantyController.createNewWarranty);
router.post("/", warrantyController.getWarrantyForSalon);
router.post("/push-warranty", warrantyController.pushWarrantyCar);
router.patch("/update", warrantyController.updateWarranty);
router.delete("/delete", warrantyController.delete);
router.post("/cancel", warrantyController.cancelWarranty);

export default router;
