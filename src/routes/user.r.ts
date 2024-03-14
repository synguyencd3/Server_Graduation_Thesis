import { Router } from 'express';
import userController from '../controllers/user.c';
import middlewareController from '../middleware/middleware';
import uploadCloud from "../middleware/uploader";

const router = Router();

router.get("/", userController.getAllUsers);
// router.get("/:id", userController.getUserById);

router.get("/profile", middlewareController.verifyToken, userController.getProfile);
// router.patch("/profile", middlewareController.verifyToken, uploadCloud.single("avatar"), userController.updateProfile);
router.post("/profile2", middlewareController.verifyToken, userController.updateProfile);

export default router;
