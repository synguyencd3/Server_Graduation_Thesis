import { Router } from 'express';
import newsController from '../controllers/news.c';

const router = Router();

router.get("/craws", newsController.crawsNews);

export default router;
