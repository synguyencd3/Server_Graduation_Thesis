import bcrypt from "bcrypt";
// import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import passport, { use } from "passport";
import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { User } from "../entities/User";
const { v4: uuidv4 } = require("uuid");

const URLClient = process.env.URL_CLIENT;

require("dotenv").config();

let refreshTokens: string[] = [];

const authController: any = {
  // generate JWT_ACCESS_TOKEN
  generateAccessToken: (user: { id: string }) => {
    return jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_ACCESS_KEY as string,
      { expiresIn: "1d" }
    );
  },

  // generate JWT_REFRESH_TOKEN
  generateRefreshToken: (user: { id: string }) => {
    return jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_REFRESH_KEY as string,
      { expiresIn: "2d" }
    );
  },

  // [POST] /register
  registerUser: async (req: Request, res: Response) => {
    let user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.fullname = req.body.fullname;
    if (
      user.username === undefined ||
      user.password === undefined
    ) {
      
      return res.json({
        status: "failed",
        error: "Missing required input data",
      });
    }

    try {
      const userRepository = getRepository(User);
      const userDb = await userRepository.findOne({
        select: ["user_id"],
        where: { username: user.username },
      })

      if (userDb != null) {
        return res.json({status: "failure", msg: "This username is existed."});
      }

    //check length password >= 6 chars
    if (user.password.length < 6) {
      return res
        .json({ status: "failure", msg: "Password length must be at least 6 characters." });
    }

    try {
      // add new user to db - Account
      user.user_id = await uuidv4();
      const salt = await bcrypt.genSalt(11);
      user.password = await bcrypt.hash(user.password, salt);
      await userRepository.save(user);
      
      return res.json({
        status: "success",
        msg: "Register successfully!"
      })
      
    } catch (error) {
      console.log(error)
      return res.json({
        status: "failure",
        msg: "Register failure."
      })
    }

    } catch (error) {
      return res.json({
        status: "failure",
        msg: "Server error, please try later."
      })
    }
  },

  // googleAuth: async (req: Request, res: Response) => {
  //   if (req.user) {
  //     const accessToken = authController.generateAccessToken(req.user);
  //     const refreshToken = authController.generateRefreshToken(req.user);

  //     refreshTokens.push(refreshToken);

  //     res.cookie("refreshToken", refreshToken, {
  //       httpOnly: true,
  //       secure: true,
  //       path: "/",
  //       sameSite: "none",
  //     });

  //     const { password, ...others } = req.user;

  //     res.json({
  //       user: others,
  //       accessToken,
  //       status: "success",
  //       message: "login successfully!",
  //     });
  //   }
  // },

  // facebookAuth: async (req: Request, res: Response) => {
  //   if (req.user) {
  //     const accessToken = authController.generateAccessToken(req.user);
  //     const refreshToken = authController.generateRefreshToken(req.user);

  //     refreshTokens.push(refreshToken);

  //     res.cookie("refreshToken", refreshToken, {
  //       httpOnly: true,
  //       secure: true,
  //       path: "/",
  //       sameSite: "none",
  //     });

  //     const { password, ...others } = req.user;

  //     res.json({
  //       user: others,
  //       accessToken,
  //       status: "success",
  //       message: "login successfully!",
  //     });
  //   }
  // },

  // [POST] /login
  // loginUser: async (req: Request, res: Response) => {
  //   const { email, password } = req.body;
  //   if (email === undefined || password === undefined) {
  //     return res.status(400).json({
  //       status: 'failed',
  //       error: 'Missing required input data',
  //     });
  //   }
    
  //   if (typeof email !== 'string' || typeof password !== 'string') {
  //     return res.status(400).json({
  //       status: 'failed',
  //       error: 'Invalid data types for input (email should be string, password should be string)',
  //     });
  //   }

  //   try {
  //     // get user from database
  //     const user = await userModel.getUserByEmail(email);
  //     if (user == null) {
  //       return res.json({ status: "failed", message: "Account or password is incorect" });
  //     }

  //     const validPassword = await bcrypt.compare(password, user.password);

  //     if (!validPassword) {
  //       res.json({ status: "failed", message: "Account or password is incorect" });
  //     } else {
  //       if (!user.activation) {
  //         return res.json({ status: "failed", message: "Please check your email to activate your account!" });
  //       }
  //       if (user.banned) {
  //         return res.json({ status: "failed", message: "Your account has been banned" });
  //       }
  //       const accessToken = authController.generateAccessToken(user);
  //       const refreshToken = authController.generateRefreshToken(user);

  //       refreshTokens.push(refreshToken);

  //       res.cookie("refreshToken", refreshToken, {
  //         httpOnly: true,
  //         secure: true,
  //         path: "/",
  //         sameSite: "none",
  //       });

  //       const { password, ...others } = user;
  //       res.json({
  //         user: others,
  //         accessToken,
  //         status: "success",
  //         message: "login successfully!",
  //       });
  //     }
  //   } catch (error) {
  //     res.json({ error, status: "failed", message: "login failure." });
  //   }
  // },

  // [POST] /refresh
  requestRefreshToken: async (req: Request, res: Response) => {
    // take refresh token from user
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json("401 Unauthorized!");

    // check if we have a refresh token but it isn't our refresh token
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("403 Forbidden!");
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY as string, (err: any, user: any) => {
      if (err) {
        console.log(err);
      }

      // delete old refresh token
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

      // create new JWT_ACCESS_TOKEN and JWT_REFRESH_TOKEN
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      res.status(200).json({ accessToken: newAccessToken });
    });
  },

  // [POST] /logout
  logoutUser: async (req: Request, res: Response) => {
    const { id } = req.body;
    if (id === undefined) {
      return res.status(400).json({
        status: 'failed',
        error: 'Missing required input data',
      });
    }
    
    if (typeof id !== 'string') {
      return res.status(400).json({
        status: 'failed',
        error: 'Invalid data types for input (id should be string)',
      });
    }


    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.clearCookie("refreshToken");
    res.status(200).json("Logged out successfully!");
  },
};

export default authController;
