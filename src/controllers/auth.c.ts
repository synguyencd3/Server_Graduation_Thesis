import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt, { decode } from "jsonwebtoken";
import passport, { use } from "passport";
import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { User } from "../entities/User";
const { v4: uuidv4 } = require("uuid");

require("dotenv").config({ path: "./server/.env" });

const URLClient = process.env.URL_CLIENT;

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

  googleAuth: async (req: Request, res: Response) => {
    let userFe: any = req.user;

    if (userFe) {
      const accessToken = authController.generateAccessToken(req.user);
      const refreshToken = authController.generateRefreshToken(req.user);

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      const { password, ...others } = userFe;

      return res.json({
        user: others,
        accessToken,
        status: "success",
        message: "login successfully!",
      });
    }
    return res.status(401).json({
      status: "failed",
      message: "Authentication failed",
    });
  },

  facebookAuth: async (req: Request, res: Response) => {
    let userFe: any = req.user;

    console.log("USER_FB: ", userFe);

    if (userFe) {
      const accessToken = authController.generateAccessToken(req.user);
      const refreshToken = authController.generateRefreshToken(req.user);

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      const { password, ...others } = userFe;

      res.json({
        user: others,
        accessToken,
        status: "success",
        message: "login successfully!",
      });
    }

    return res.status(401).json({
      status: "failed",
      message: "Authentication failed",
    });
  },

  // [POST] /login
  loginUser: async (req: Request, res: Response) => {
    const username = req.body.username;
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

    if (!refreshToken) return res.json({ status: "failed", msg: "401 Unauthorized!" });

    // check if we have a refresh token but it isn't our refresh token
    if (!refreshTokens.includes(refreshToken)) {
      return res.json({ status: "failed", msg: "403 Forbidden!" });
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
    const { user_id } = req.body;
    if (user_id === undefined) {
      return res.json({
        status: 'failed',
        error: 'Missing required input data',
      });
    }

    if (typeof user_id !== 'string') {
      return res.json({
        status: 'failed',
        error: 'Invalid data types for input (user_id should be string)',
      });
    }


    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.clearCookie("refreshToken");
    res.json("Logged out successfully!");
  },

  inviteByEmail: async (req: Request, res: Response) => {
    // check if email exists
    const { email } = req.body;
    if (email === undefined) {
      return res.status(400).json({
        status: 'failed',
        error: 'Missing required input data',
      });
    }

    if (typeof email !== 'string') {
      return res.status(400).json({
        status: 'failed',
        error: 'Invalid data types for input (email should be string)',
      });
    }

    try {
      const token = jwt.sign(
        { email, group: "" },
        process.env.JWT_SECRETKEY_MAIL || "jwt_key_mail",
        {
          expiresIn: "10m",
        }
      );

      const mailConfigurations = {
        from: process.env.EMAIL_ADDRESS || "webnangcao.final@gmail.com",
        to: email,
        subject: "Email Verification - Cars Salon App",
        text: `Hi! There, you have recently visited 
  our website and entered your email.
  Please follow the given link to join in group:
  ${URLClient}/auth/verify-token-email/${token}
  Thanks`,
      };

      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      transporter.sendMail(mailConfigurations, function (error) {
        if (error) {
          return res.json({
            status: "failed",
            message: "Server is error now",
          });
        } else {
          return res.json({
            status: "success",
            message: "Sent mail successfully!",
          });
        }
      });
    } catch (error) {
      return res.json({
        status: "failed",
        message: "Error invite, please check information again.",
      });
    }
  },

  // [GET] /verify-invite/token
  verifyInviteFromMail: async (req: Request, res: Response) => {
    const { token } = req.params;

    jwt.verify(token, process.env.JWT_SECRETKEY_MAIL || "jwt_key_mail", async (err, decoded: any) => {
      if (!err) {
        const email = decoded.email;
        const group = decoded.group;

        try {
          const userRepository = getRepository(User);
          const userDb: any = await userRepository.findOne({
            select: ["user_id", "username", "email"],
            where: { email: email }
          })

          // the user does not have an account on the system
          if (!userDb.user_id) {
            // create new user with username = email
            let user = new User();
            const defaultPassword = "123abc@";
            const salt = await bcrypt.genSalt(11);

            user.user_id = await uuidv4();
            user.username = email
            user.password = await bcrypt.hash(defaultPassword, salt);
            user.fullname = email;
            user.email = email;
            await userRepository.save(user);

            const mailConfigurations = {
              from: process.env.EMAIL_ADDRESS || "webnangcao.final@gmail.com",
              to: email,
              subject: "Email password - Cars Salon App",
              text: "Your password is 123abc@. Please change it, thank you."
            };

            const transporter = nodemailer.createTransport({
              service: process.env.EMAIL_SERVICE,
              auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
              },
            });

            // send default password to user
            transporter.sendMail(mailConfigurations, function (error) {
              if (error) {
                return res.json({
                  status: "failed",
                  message: "Server is error now",
                });
              } else {
                res.json({
                  status: "success",
                  message: "The password sent to your mail.",
                });
              }
            });
            // login for user
            // const accessToken = authController.generateAccessToken(email);
            // const refreshToken = authController.generateRefreshToken(email);

            // refreshTokens.push(refreshToken);

            // res.cookie("refreshToken", refreshToken, {
            //   httpOnly: true,
            //   secure: true,
            //   path: "/",
            //   sameSite: "none",
            // });

            return res.redirect("http://localhost:5000/");
          } else {
            // join group
            return res.redirect("http://localhost:5000/");
          }
        } catch (error) {
          return res.json({
            status: "failed",
            message: "Error join, please try again.",
          });
        }
      }
      // token is incorrect
      return res.send({
        status: "failed",
        message: "Token is not valid or expired",
      });
    });
  },

  homePage: async (req: Request, res: Response) => {
    res.json("Deploy successfully!");
  }
};

export default authController;
