import { Request, Response, NextFunction } from 'express';
import UserService from "../services/user-service";
import middlewareController from './middlewares/middleware';
import uploadCloud from "./middlewares/uploader";
import { PublishAuthEvent } from '../utils';
import dotenv from 'dotenv';

dotenv.config();

export const user = (app: any) => {
    const service = new UserService();

    app.get("/profile", middlewareController.verifyToken, async (req: Request, res: Response, next: NextFunction) => {
        const userId: any = req.headers['userId'] || "";
        
        try {
            const data  = await service.getProfile({ userId });

            return res.json(data);
        } catch (err: any) {
            next(err);
        }
    });

    app.patch("/profile", middlewareController.verifyToken, uploadCloud.single("avatar"), async (req: Request, res: Response, next: NextFunction) => {
        const userId: any = req.headers['userId'] || "";
        
        try {
            const data  = await service.updateProfile({ userId });

            return res.json(data);
        } catch (err: any) {
            next(err);
        }
    });

}
