import { Request, Response, NextFunction } from 'express';
import AuthService from "../services/auth-service";
import dotenv from 'dotenv';

dotenv.config();

module.exports = (app: any) => {
    const service = new AuthService();

    app.post("/auth/register", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password, fullname } = req.body;
            const { data } = await service.registerUser({ username, password, fullname });
            
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.post("/auth/login", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password } = req.body;
            const data  = await service.loginUser({ username, password });

            return res.json(data);
        } catch (err) {
            next(err);
        }
    });
}
