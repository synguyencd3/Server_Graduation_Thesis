import { Router } from 'express';
import userController from '../controllers/user.c';
import middlewareController from '../middleware/middleware';

const router = Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

router.get("/profile", middlewareController.verifyToken, userController.getProfile);
router.post("/profile", middlewareController.verifyToken, userController.updateProfile);

export default router;
