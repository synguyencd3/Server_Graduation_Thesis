import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt, { decode } from "jsonwebtoken";
import passport, { use } from "passport";
import { Request, Response } from "express";
import { getRepository, getManager  } from "typeorm";

import { User } from "../entities/User";
const { v4: uuidv4 } = require("uuid");

require("dotenv").config({ path: "./server/.env" });

let refreshTokens: string[] = [];

const authController: any = {
  // generate JWT_ACCESS_TOKEN
  generateAccessToken: (user: { user_id: string }) => {
    return jwt.sign(
      {
        userId: user.user_id,
      },
      process.env.JWT_ACCESS_KEY as string,
      { expiresIn: "2h" }
    );
  },

  // generate JWT_REFRESH_TOKEN
  generateRefreshToken: (user: { user_id: string }) => {
    return jwt.sign(
      {
        userId: user.user_id,
      },
      process.env.JWT_REFRESH_KEY as string,
      { expiresIn: "14d" }
    );
  },

  // [POST] /register
  registerUser: async (req: Request, res: Response) => {
    let user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.fullname = req.body.fullname;
    user.avatar =
      "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
    user.role = "User";
    user.aso = 0;

    if (user.username === undefined || user.password === undefined) {
      return res.json({
        status: "failed",
        msg: "Missing required input data",
      });
    }

    try {
      const userRepository = getRepository(User);
      const userDb = await userRepository.findOne({
        select: ["user_id"],
        where: { username: user.username },
      });

      if (userDb != null) {
        return res.json({ status: "failed", msg: "This username is existed." });
      }

      //check length password >= 6 chars
      if (user.password.length < 6) {
        return res.json({
          status: "failed",
          msg: "Password length must be at least 6 characters.",
        });
      }

      try {
        // add new user to db - Account
        user.user_id = await uuidv4();
        const salt = await bcrypt.genSalt(11);
        user.password = await bcrypt.hash(user.password, salt);
        await userRepository.save(user);

        return res.json({
          status: "success",
          msg: "Register successfully!",
        });
      } catch (error) {
        console.log(error);
        return res.json({
          status: "failed",
          msg: "Register failure.",
        });
      }
    } catch (error) {
      return res.json({
        status: "failed",
        msg: "Server error, please try later.",
      });
    }
  },

  googleAuth: async (req: Request, res: Response) => {
    let userFe: any = req.user;
    const userIdAccount: any = req.headers['userId'];

    // console.log("USer id: ", userIdAccount);

    // action for association
    if(userIdAccount && typeof userIdAccount == "string") {
      // check aso of this account in db
      const userRepository = getRepository(User);
      const userDb: User|null = await userRepository.findOne({
        where: {user_id: userIdAccount}
      })

      // console.log("USER_DB: ", userDb);

      const userGGDb: User|null = await userRepository.findOne({
        select: ["aso"],
        where: {google: userFe.google}
      })
      // console.log("USER_GGDB: ", userGGDb);

      if(!userDb) {
        return res.json({
          status: "failed",
          msg: "invalid information account."
        })
      }

      if (userDb.google) {
        return res.json({
          status: "failed",
          msg: "This account is linked."
        })
      }

      console.log("FLAG1");

      try {
        // link successfully
        if ((!userGGDb) || (userGGDb.aso == 0) || (userDb.username && userFe.aso == 3) || (userDb.facebook && userFe.aso == 1)) {
          console.log("FLAG2");
          userDb.google = userFe.google;
          const entityManager = getManager();

          await entityManager.transaction(async transactionalEntityManager => {
            // find and delete old google account.
            const oldUser = await transactionalEntityManager.findOne(User, { where: {google: userFe.google}});
            // console.log("OLD_USER: ", oldUser);
            if (oldUser) {
              await transactionalEntityManager.remove(oldUser);
              console.log("FLAG4");             
            } else {
              throw new Error('Cannot find old google account.');
            }
            console.log("FLAG3");
            // save new information for this user with new google.
            await transactionalEntityManager.save(userDb);

            console.log("FLAG5");
        });
  
          return res.json ({
            status: "success",
            msg: "linked with google successfully!"
          })
        } else {
          return res.json({
            status: "failed",
            msg: "Not eligible for linking."
          })
        }
        
      } catch (error) {
        return res.json({
          status: "failed",
          msg: "error with db."
        })
      }

    } 

    // action for login
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
      // console.log("USER: ", userFe);

      return res.json({
        refreshToken,
        user: others,
        accessToken,
        status: "success",
        msg: "login successfully!",
      });
    }

    return res.status(401).json({
      status: "failed",
      msg: "Authentication failed",
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
      console.log("Refrest Token: ", refreshToken);

      const { password, ...others } = userFe;

      return res.json({
        user: others,
        accessToken,
        status: "success",
        msg: "login successfully!",
      });
    }

    return res.status(401).json({
      status: "failed",
      msg: "Authentication failed",
    });
  },

  // [POST] /login
  loginUser: async (req: any, res: any) => {
    const username = req.body.username;
    const passwordInput = req.body.password;
    if (username === undefined || passwordInput === undefined) {
      return res.json({
        status: "failed",
        msg: "Missing required input data",
      });
    }

    if (typeof username !== "string" || typeof passwordInput !== "string") {
      return res.json({
        status: "failed",
        msg: "Invalid data types for input (username should be string, password should be string)",
      });
    }

    try {
      // get user from database
      const userRepository = getRepository(User);
      const userDb = await userRepository.findOne({
        where: { username: username },
      });

      if (userDb == null) {
        return res.json({
          status: "failed",
          msg: "Username or password is incorect.",
        });
      }

      const validPassword = await bcrypt.compare(
        passwordInput,
        userDb.password
      );

      if (!validPassword) {
        return res.json({
          status: "failed",
          msg: "Username or password is incorect.",
        });
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
      return res.json({
        refreshToken,
        user: others,
        accessToken,
        status: "success",
        msg: "login successfully!",
      });
    } catch (error) {
      res.json({ status: "failed", msg: "login failure." });
    }
  },

  // [POST] /refresh
  requestRefreshToken: async (req:any, res:any) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken)
      return res.json({ status: "failed", msg: "401 Unauthorized!" });

    // check if we have a refresh token but it isn't our refresh token
    if (!refreshTokens.includes(refreshToken)) {
      return res.json({ status: "failed", msg: "403 Forbidden!" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_KEY as string,
      (err: any, user: any) => {
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

        return res.json({ accessToken: newAccessToken, refreshToken:  newRefreshToken});
      }
    );
  },

  // [POST] /logout
  logoutUser: async (req: Request, res: Response) => {
    const { user_id } = req.body;
    if (user_id === undefined) {
      return res.json({
        status: "failed",
        msg: "Missing required input data",
      });
    }

    if (typeof user_id !== "string") {
      return res.json({
        status: "failed",
        msg: "Invalid data types for input (user_id should be string)",
      });
    }

    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken || req.body.refreshToken
    );
    res.clearCookie("refreshToken");
    res.json("Logged out successfully!");
  },

  inviteByEmail: async (req: Request, res: Response) => {
    // check if email exists
    const { email } = req.body;
    console.log(email);
    if (email === undefined) {
      return res.status(400).json({
        status: "failed",
        msg: "Missing required input data",
      });
    }

    if (typeof email !== "string") {
      return res.status(400).json({
        status: "failed",
        msg: "Invalid data types for input (email should be string)",
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
  ${process.env.URL_CLIENT}/auth/verify-token-email/${token}
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
            msg: "Server is error now",
          });
        } else {
          return res.json({
            status: "success",
            msg: "Sent mail successfully!",
          });
        }
      });
    } catch (error) {
      return res.json({
        status: "failed",
        msg: "Error invite, please check information again.",
      });
    }
  },

  // [GET] /verify-invite/token
  verifyInviteFromMail: async (req: Request, res: Response) => {
    const token: string|undefined = req.params.token;

    if(!token) {
      return res.json({
        status: "failed",
        "msg": "Token is invalid."
      })
    }

    jwt.verify(
      token,
      process.env.JWT_SECRETKEY_MAIL || "jwt_key_mail",
      async (err, decoded: any) => {
        if (!err) {
          const email = decoded.email;
          const group = decoded.group;

          try {
            const userRepository = getRepository(User);
            const userDb: any = await userRepository.findOne({
              select: ["user_id", "username", "email"],
              where: { email: email },
            });

            // the user does not have an account on the system
            if (!userDb) {
              // create new user with username = email
              let user = new User();
              const defaultPassword = "123abc@";
              const salt = await bcrypt.genSalt(11);

              user.user_id = await uuidv4();
              user.username = email;
              user.password = await bcrypt.hash(defaultPassword, salt);
              user.fullname = email;
              user.email = email;
              user.aso = 0;
              await userRepository.save(user);

              const mailConfigurations = {
                from: process.env.EMAIL_ADDRESS || "webnangcao.final@gmail.com",
                to: email,
                subject: "Email password - Cars Salon App",
                text: "Your password is 123abc@. Please change it, thank you.",
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
                    msg: "Server is error now",
                  });
                } else {
                  res.json({
                    status: "success",
                    msg: "The password sent to your mail.",
                  });
                }
              });
              // login for user
              const accessToken = authController.generateAccessToken(email);
              const refreshToken = authController.generateRefreshToken(email);

              refreshTokens.push(refreshToken);

              res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "none",
              });

              const { password, ...others } = userDb;
              return res.json({
                refreshToken,
                user: others,
                accessToken,
                status: "success",
                msg: "login successfully!",
              });
            } else {
              // call function loginUser in here

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
              return res.json({
                user: others,
                accessToken,
                status: "success",
                msg: "login successfully!",
              });
            }
          } catch (error) {
            console.log(error);
            return res.json({
              status: "failed",
              msg: "Error join, please try again.",
            });
          }
        }
        // token is incorrect
        return res.send({
          status: "failed",
          msg: "Token is not valid or expired",
        });
      }
    );
  },
};

export default authController;
