import { Router, Request, Response, NextFunction } from 'express';
import associationcController from '../controllers/association.c';
import passport from 'passport';

const router = Router();

router.get("/google",  passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/google/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', (err: any, profile: any) => {
      if(err) {
        console.error("Error during authentication:", err);
        return next(err);
      }
      req.user = profile;
      next();
    })(req, res, next);
  },
  associationcController.google
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

router.get('/facebook/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('facebook', (err: any, profile: any) => {
      if(err) {
        console.error("Error during authentication:", err);
        return next(err);
      }
      req.user = profile;
      next();
    })(req, res, next);
  },
  associationcController.facebook
);

export default router;
