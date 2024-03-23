import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { Salon } from '../entities';

const middlewareController = {
  // verify token
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization || req.headers['authorization'];
    if (token) {
      const accessToken = token.split(" ")[1];
      // console.log("accessToken1: ", accessToken);
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY as string, (err: any, decoded: any) => {
        if (err) {
          return res.status(401).json({ status: "failed", msg: "Token isn't valid!" });
        }
        //req.user = user;
        (req as Request).headers.userId = decoded.userId;
        next();
      });
    } else {
      return res.json({ status: "failed", msg: "You're not authenticated!" });
    }
  },

  verifyRefreshToken: (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string | undefined = req.cookies.refreshToken || req.headers['authorization'];

    if (refreshToken) {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY as string, (err: any, user: any) => {
        if (err) {
          return res.status(401).json({ status: "failed", msg: "Token isn't valid!" });
        }
        (req as Request).headers.userId = user.userId;
        next();
      });
    } else {
      return res.json({ status: "failed", msg: "You're not authenticated!" });
    }
  },

  getUserId: (req: Request, res: Response, next: NextFunction) => {
    // get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // check token is null
    if (token) {
      // token is not null, we verify and get userId
      jwt.verify(token, process.env.JWT_ACCESS_KEY as string, (err, decoded: any) => {

        if (err) {
          return res.status(403).json({ msg: 'Forbidden' });
        }
        // get userid
        (req as Request).headers.userId = decoded.userId;
      });
    }

    next();

  },

  isAdminOfSalon: async (req: Request, res: Response, next:NextFunction ) => {
    const userId: any = req.headers['userId'] || "";
    const {salonId} = req.body;
    const salonRepository = getRepository(Salon);
    try {
      await salonRepository.findOneOrFail({
        where: {user: userId, salon_id: salonId}
      })
      
      next();
    } catch (error) {
      return res.status(403).json({
        status: "failed",
        msg: "Unauthorized"
      })
    }
    
  }
};

export default middlewareController;
