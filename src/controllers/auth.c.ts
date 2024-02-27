import bcrypt from "bcrypt";
// import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Request, Response } from "express";
import userModel from "../models/user.m.js"; // Assuming this is the module where userModel is defined

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
  // registerUser: async (req: Request, res: Response) => {
  //   if (
  //     req.body.email === undefined ||
  //     req.body.password === undefined ||
  //     req.body.fullName === undefined
  //   ) {
  //     return res.status(400).json({
  //       status: "failed",
  //       error: "Missing required input data",
  //     });
  //   }

  //   if (
  //     typeof req.body.email !== "string" ||
  //     typeof req.body.password !== "string" ||
  //     typeof req.body.fullName !== "string"
  //   ) {
  //     return res.status(400).json({
  //       status: "failed",
  //       error:
  //         "Invalid data types for input (email should be string, password should be string, fullName should be string)",
  //     });
  //   }

  //   try {
  //     // check if email exists
  //     const checkEmail = await userModel.getUserByEmail(req.body.email);
  //     if (checkEmail != null) {
  //       return res.status(404).json("Email already exists!");
  //     }

  //     // hash password
  //     const salt = await bcrypt.genSalt(11);
  //     const hashed = await bcrypt.hash(req.body.password, salt);

  //     // create new user
  //     const user = {
  //       email: req.body.email,
  //       password: hashed,
  //       fullName: req.body.fullName,
  //     };

  //     // save user to database
  //     const { password, ...others } = await userModel.addUser(user);

  //     res.status(200).json(others);
  //   } catch (error) {
  //     res.status(500).json(error);
  //   }
  // },

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
