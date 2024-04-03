import { Request, Response, NextFunction } from 'express';
import AuthService from "../services/auth-service";
import dotenv from 'dotenv';
import { PublishUserEvent } from '../utils'
import passport from 'passport';
import middlewareController from './middlewares/middleware';
import axios from 'axios';
import { User } from '../database/models';

dotenv.config();

module.exports = (app: any) => {
    const service = new AuthService();

    app.post("/register", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password, fullname } = req.body;
            const data = await service.registerUser({ username, password, fullname });

            return res.json(data);
        } catch (err: any) {
            next(err);
        }
    });

    app.post("/login", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password } = req.body;
            const data: any = await service.loginUser({ username, password });

            res.cookie("refreshToken", data.refreshToken, {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "none",
            });

            return res.json(data);
        } catch (err: any) {
            next(err);
        }
    });

    app.get("/google", passport.authenticate('google', { scope: ['email', 'profile'] }));

    app.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('google', (err: any, profile: any) => {
            console.log("GG HERE");
            if (err) {
                console.error("Error during authentication:", err);
                return next(err);
            }
            req.user = profile;
            next();
        })(req, res, next);
    }, middlewareController.getUserId,
        async (req: Request, res: Response, next: NextFunction) => {
            const data = {
                user: req.user,
                userId: req.headers['userId'],
            }
            const rs = await service.googleAuth(data);

            res.cookie("refreshToken", rs?.refreshToken, {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "none",
            });

            return res.json(rs)
        })

    /*
      aso = 
      0: only login by this
      1: with google + username
      2: with facebook + username
      3: with google + facebook
      4: with username + google + facebook
    */

    app.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

    app.get('/facebook/callback',
        (req: Request, res: Response, next: NextFunction) => {
            passport.authenticate('facebook', (err: any, profile: any) => {
                if (err) {
                    console.error("Error during authentication:", err);
                    return next(err);
                }
                req.user = profile;
                next();
            })(req, res, next);
        }, middlewareController.getUserId,
        async (req: Request, res: Response, next: NextFunction) => {
            const data = {
                user: req.user,
                userId: req.headers['userId'],
            }
            const rs = await service.facebookAuth(data)

            res.cookie("refreshToken", rs?.refreshToken, {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "none",
            });

            return res.json(rs);
        })

    app.post('/facebook-mobile', middlewareController.getUserId, async (req: Request, res: Response, next: NextFunction) => {
        const data = {
            accessToken: req.body.accessToken,
            user: req.user,
            userId: req.headers['userId'],
        }
        const rs = await service.facebookMBAuth(data)

        res.cookie("refreshToken", rs?.refreshToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "none",
        });

        return res.json(rs);
    });

    app.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
        console.log("Logout")
        await service.logoutUser(req);
        res.clearCookie("refreshToken");
        res.json("Logged out successfully!");
    });

    app.post("/refresh", middlewareController.verifyRefreshToken, async (req: Request, res: Response, next: NextFunction) => {
        const { accessToken, refreshToken }: any = await service.requestRefreshToken(req);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "none",
        });

        return res.json({ accessToken: accessToken, refreshToken: refreshToken });
    });

}
