import { Router } from 'express';
import userController from '../controllers/payment.c';

const router = Router();

router.post("/createOrder", userController.createOrder);
router.post("/queryOrder", userController.queryOrder);

router.post("/vnpay", userController.vnpay);

export default router;
