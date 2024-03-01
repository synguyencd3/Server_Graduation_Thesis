import { Router } from 'express';
import apidocController from '../controllers/apidoc.c';

const router = Router();

router.get("/", apidocController.homePage);

export default router;
