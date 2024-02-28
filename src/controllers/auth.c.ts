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
        return res.json({ status: "failed", msg: "This username is existed." });
      }

      //check length password >= 6 chars
      if (user.password.length < 6) {
        return res
          .json({ status: "failed", msg: "Password length must be at least 6 characters." });
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
          status: "failed",
          msg: "Register failure."
        })
      }

    } catch (error) {
      return res.json({
        status: "failed",
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
  loginUser: async (req: Request, res: Response) => {
    const  username = req.body.username;
    const passwordInput = req.body.password;
    if (username === undefined || passwordInput === undefined) {
      return res.json({
        status: 'failed',
        error: 'Missing required input data',
      });
    }

    if (typeof username !== 'string' || typeof passwordInput !== 'string') {
      return res.json({
        status: 'failed',
        error: 'Invalid data types for input (username should be string, password should be string)',
      });
    }

    try {
      // get user from database
      const userRepository = getRepository(User);
      const userDb = await userRepository.findOne({
        select: ["user_id", "password", "username", "fullname", "gender", "phone", "email", "address", "avatar", "role"],
        where: { username: username },
      });

      if (userDb == null) {
        return res.json({ status: "failed", message: "Username or password is incorect." });
      }

      const validPassword = await bcrypt.compare(passwordInput, userDb.password);

      if (!validPassword) {
        res.json({ status: "failed", message: "Username or password is incorect." });
      }
      const accessToken = authController.generateAccessToken(userDb);
      const refreshToken = authController.generateRefreshToken(userDb);

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      const { password, ...others } = userDb;
      res.json({
        user: others,
        accessToken,
        status: "success",
        message: "login successfully!",
      });
    }
    catch (error) {
      res.json({ status: "failed", msg: "login failure." });
    }
  },

  // [POST] /refresh
  requestRefreshToken: async (req: Request, res: Response) => {
    // take refresh token from user
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.json({status: "failed", msg: "401 Unauthorized!"});

    // check if we have a refresh token but it isn't our refresh token
    if (!refreshTokens.includes(refreshToken)) {
      return res.json({status: "failed", msg: "403 Forbidden!"});
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

      res.json({ accessToken: newAccessToken });
    });
  },

  // [POST] /logout
  logoutUser: async (req: Request, res: Response) => {
    const { id } = req.body;
    if (id === undefined) {
      return res.json({
        status: 'failed',
        error: 'Missing required input data',
      });
    }

    if (typeof id !== 'string') {
      return res.json({
        status: 'failed',
        error: 'Invalid data types for input (id should be string)',
      });
    }


    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.clearCookie("refreshToken");
    res.json("Logged out successfully!");
  },
};

export default authController;
