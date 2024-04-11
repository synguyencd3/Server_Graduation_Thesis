import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import authController from "../controllers/auth.c";
import middlewareController from "../middleware/middleware";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

// Google authentication route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", (err: any, profile: any) => {
      if (err) {
        console.error("Error during authentication:", err);
        return next(err);
      }
      req.user = profile;
      next();
    })(req, res, next);
  },
  middlewareController.getUserId,
  authController.googleAuth
);

// Facebook authentication route
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

router.get(
  "/facebook/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("facebook", (err: any, profile: any) => {
      if (err) {
        console.error("Error during authentication:", err);
        return next(err);
      }
      req.user = profile;
      next();
    })(req, res, next);
  },
  middlewareController.getUserId,
  authController.facebookAuth
);

router.post(
  "/facebook-mobile",
  middlewareController.getUserId,
  authController.facebookAuthMobile
);

router.post(
  "/refresh",
  middlewareController.verifyRefreshToken,
  authController.requestRefreshToken
);

// router.post("/logout", middlewareController.verifyToken, authController.logoutUser);
router.post("/logout", authController.logoutUser);

router.post("/change-pw", middlewareController.verifyToken, authController.changePassword);

export default router;
