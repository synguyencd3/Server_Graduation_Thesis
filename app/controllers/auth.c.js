const userModel = require("../models/user.m");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// const URLSever = process.env.URLSEVER;
const URLClient = process.env.URL_CLIENT;

const passport = require('passport');
require("dotenv").config();

let refreshTokens = [];

const authController = {
  // generate JWT_ACCESS_TOKEN
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "1d" }
    );
  },

  // generate JWT_REFRESH_TOKEN
  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "2d" }
    );
  },

  // [POST] /register
  registerUser: async (req, res) => {
    if (req.body.email === undefined || req.body.password === undefined || req.body.fullName === undefined) {
      return res.status(400).json({
        status: 'failed',
        error: 'Missing required input data',
      });
    }

    if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string' || typeof req.body.fullName !== 'string') {
      return res.status(400).json({
        status: 'failed',
        error: 'Invalid data types for input (email should be string, password should be string, fullName should be string)',
      });
    }

    try {
      // check if email exists
      const checkEmail = await userModel.getUserByEmail(req.body.email);
      if (checkEmail != null) {
        return res.status(404).json("Email already exists!");
      }

      // hash password
      const salt = await bcrypt.genSalt(11);
      const hashed = await bcrypt.hash(req.body.password, salt);

      // create new user
      const user = {
        email: req.body.email,
        password: hashed,
        fullName: req.body.fullName,
      };

      // save user to database
      const { password, ...others } = await userModel.addUser(user);

      res.status(200).json(others);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  // [POST] /register-email
  registerUserByEmail: async (req, res) => {
    // check if email exists
    const { email, password, fullName } = req.body;
    if (email === undefined || password === undefined || fullName === undefined) {
      return res.status(400).json({
        status: 'failed',
        error: 'Missing required input data',
      });
    }
    
    if (typeof email !== 'string' || typeof password !== 'string' || typeof fullName !== 'string') {
      return res.status(400).json({
        status: 'failed',
        error: 'Invalid data types for input (email should be string, password should be string, fullName should be string)',
      });
    }
    
    const checkEmail = await userModel.getUserByEmail(email);
    if (checkEmail?.activation) {
      return res.json({
        status: "failed",
        message: "Email already exists!"
      });
    }

    const salt = await bcrypt.genSalt(11);
    const passwordHashed = await bcrypt.hash(password, salt);

    // create new user
    const user = {
      email: email,
      password: passwordHashed,
      fullName: fullName,
    };

    // email does not exist yet
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRETKEY_MAIL,
      {
        expiresIn: "10m",
      }
    );

    try {
      if (checkEmail?.activation === false) {
        await userModel.updateUserByEmail(user);
      }
      else {
        await userModel.addUser(user);
      }

      const mailConfigurations = {
        from: process.env.EMAIL_ADDRESS || "webnangcao.final@gmail.com",
        to: email,
        subject: "Email Verification - Classroom App",
        text: `Hi! There, you have recently visited 
      our website and entered your email.
      Please follow the given link to verify your email
      ${URLClient}/verify-token-email/sigup-email/${token}
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
            message: "Check verify code in your email.",
          });
        }
      });
    } catch (error) {
      return res.json({
        status: "failed",
        message: "Error register, please check information again.",
      });
    }
  },

  // [GET] /verify-email/token
  verifySignupTokenFromMail: async (req, res) => {
    const { token } = req.params;

    // console.log("verify sigup email: ", token)

    jwt.verify(token, process.env.JWT_SECRETKEY_MAIL, async (err, decoded) => {
      if (!err) {

        // create new user
        const user = {
          email: decoded.email,
        };

        // save user to database
        try {
          await userModel.activeUser(user);
          // console.log("success", others, )
          return res.json({
            status: "success",
            message: "Active successfully!"
          });
        } catch (error) {
          return res.json({
            status: "failed",
            message: "Error active, please try agian!",
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

  googleAuth: async (req, res) => {
    if (req.user) {
      const accessToken = authController.generateAccessToken(req.user);
      const refreshToken = authController.generateRefreshToken(req.user);

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      const { password, ...others } = req.user;

      res.json({
        user: others,
        accessToken,
        status: "success",
        message: "login successfully!",
      });
    }
  },

  facebookAuth: async (req, res) => {
    if (req.user) {
      const accessToken = authController.generateAccessToken(req.user);
      const refreshToken = authController.generateRefreshToken(req.user);

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none",
      });

      const { password, ...others } = req.user;

      res.json({
        user: others,
        accessToken,
        status: "success",
        message: "login successfully!",
      });
    }
  },

  // [POST] /login
  loginUser: async (req, res) => {
    const { email, password } = req.body;
    if (email === undefined || password === undefined) {
      return res.status(400).json({
        status: 'failed',
        error: 'Missing required input data',
      });
    }
    
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        status: 'failed',
        error: 'Invalid data types for input (email should be string, password should be string)',
      });
    }

    try {
      // get user from database
      const user = await userModel.getUserByEmail(email);
      if (user == null) {
        return res.json({ status: "failed", message: "Account or password is incorect" });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        res.json({ status: "failed", message: "Account or password is incorect" });
      } else {
        if (!user.activation) {
          return res.json({ status: "failed", message: "Please check your email to activate your account!" });
        }
        if (user.banned) {
          return res.json({ status: "failed", message: "Your account has been banned" });
        }
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);

        refreshTokens.push(refreshToken);

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          path: "/",
          sameSite: "none",
        });

        const { password, ...others } = user;
        res.json({
          user: others,
          accessToken,
          status: "success",
          message: "login successfully!",
        });
      }
    } catch (error) {
      res.json({ error, status: "failed", message: "login failure." });
    }
  },

  // [POST] /refresh
  requestRefreshToken: async (req, res) => {
    // take refresh token from user
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json("401 Unauthorized!");

    // check if we have a refresh token but it isn't our refresh token
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("403 Forbidden!");
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
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
  logoutUser: async (req, res) => {
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

module.exports = authController;
