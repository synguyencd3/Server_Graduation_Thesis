import { Router } from 'express';
import carController from '../controllers/car.c';
import uploadCloud from "../middleware/uploader";

const router = Router();

router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.get("/brand/:brand/salon/:salon_id", carController.getAllCarsByBrandOfSalon);
router.post("/", uploadCloud.array("image", 5), carController.createCar);
router.patch("/:id", uploadCloud.array("image", 5), carController.updateCar);
router.delete("/:id", carController.deleteCar); 

export default router;