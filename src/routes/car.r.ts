import { Router } from 'express';
import carController from '../controllers/car.c';
import uploadCloud from "../middleware/uploader";
import middlewareController from '../middleware/middleware';

const router = Router();

router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.get("/brand/:brand/salon/:salon_id", carController.getAllCarsByBrandOfSalon);
router.post("/", uploadCloud.array("image", 5), middlewareController.isAdminOfSalon, carController.createCar);
router.patch("/:id", uploadCloud.array("image", 5), middlewareController.isAdminOfSalon, carController.updateCar);
router.delete("/:id", carController.deleteCar); 

export default router;