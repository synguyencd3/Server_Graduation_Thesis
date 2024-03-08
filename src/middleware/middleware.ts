import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const middlewareController = {
  // verify token
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization || req.headers['authorization'];
    if (token) {
      const accessToken = token.split(" ")[1];
      console.log("accessToken1: ", accessToken);
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY as string, (err: any, user: any) => {
        if (err) {
          return res.status(401).json({status: "failed", msg:"Token isn't valid!"});
        }
        req.user = user;
        next();
      });
    } else {
      return res.json({status: "failed", msg:"You're not authenticated!"});
    }
  },
  
  verifyRefreshToken: (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string|undefined = req.cookies.refreshToken || req.headers['authorization'];

    if (refreshToken) {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY as string, (err: any, user: any) => {
        if (err) {
          return res.status(401).json({status: "failed", msg:"Token isn't valid!"});
        }
        next();
      });
    } else {
      return res.json({status: "failed", msg:"You're not authenticated!"});
    }
  }
};

export default middlewareController;
